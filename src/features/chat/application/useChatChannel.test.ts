import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRealtimeSession } from "@/shared/realtime/realtimeSocket";
import { session as authSession } from "@/shared/session/session";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import { makeChatMessage, makeChatSession } from "@/test/chatFixtures";
import { createFakeSocket } from "@/test/fakeSocket";
import { chatGateway } from "../data/chatGateway";
import { useChatChannel } from "./useChatChannel";

vi.mock("@/shared/realtime/useRealtimeSocket", () => ({ default: vi.fn() }));
vi.mock("@/shared/realtime/realtimeSocket", () => ({
  getRealtimeSession: vi.fn(),
}));
vi.mock("@/shared/session/session", () => ({
  session: { isAuthenticated: vi.fn() },
}));
vi.mock("../data/chatGateway", () => ({
  chatGateway: { fetchHistory: vi.fn() },
}));

const baseOptions = {
  noTokenError: "sem token",
  connectError: "falha de conexão",
};

describe("useChatChannel", () => {
  let socket: ReturnType<typeof createFakeSocket>;

  beforeEach(() => {
    socket = createFakeSocket();
    vi.mocked(useRealtimeSocket).mockReturnValue(socket as never);
    vi.mocked(authSession.isAuthenticated).mockReturnValue(true);
    vi.mocked(getRealtimeSession).mockReturnValue(null);
  });

  it("começa carregando, sem mensagens e sem sessão", () => {
    const { result } = renderHook(() => useChatChannel(baseOptions));
    expect(result.current.loading).toBe(true);
    expect(result.current.messages).toEqual([]);
    expect(result.current.session).toBeNull();
    expect(result.current.selectedUnitId).toBe("");
  });

  it("session:ready guarda a sessão e seleciona a loja da conta", () => {
    const { result } = renderHook(() => useChatChannel(baseOptions));
    const payload = makeChatSession({ unitStoreId: 20 });
    act(() => socket.emit("session:ready", payload));
    expect(result.current.session).toBe(payload);
    expect(result.current.selectedUnitId).toBe("20");
  });

  it("session:ready sem loja deixa a seleção vazia", () => {
    const { result } = renderHook(() => useChatChannel(baseOptions));
    act(() =>
      socket.emit("session:ready", makeChatSession({ unitStoreId: null })),
    );
    expect(result.current.selectedUnitId).toBe("");
  });

  it("chat:history substitui as mensagens e encerra o loading", () => {
    const { result } = renderHook(() => useChatChannel(baseOptions));
    const history = [makeChatMessage({ id: 1 }), makeChatMessage({ id: 2 })];
    act(() => socket.emit("chat:history", history));
    expect(result.current.messages).toEqual(history);
    expect(result.current.loading).toBe(false);
  });

  it("chat:message acrescenta ao final e chama onMessage com a sessão atual", () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() =>
      useChatChannel({ ...baseOptions, onMessage }),
    );
    const sessionPayload = makeChatSession();
    act(() => socket.emit("session:ready", sessionPayload));
    act(() => socket.emit("chat:history", [makeChatMessage({ id: 1 })]));
    const incoming = makeChatMessage({ id: 2 });
    act(() => socket.emit("chat:message", incoming));
    expect(result.current.messages.map((m) => m.id)).toEqual([1, 2]);
    expect(onMessage).toHaveBeenCalledWith(incoming, sessionPayload);
  });

  it("chat:message antes da sessão chama onMessage com sessão nula", () => {
    const onMessage = vi.fn();
    renderHook(() => useChatChannel({ ...baseOptions, onMessage }));
    const incoming = makeChatMessage();
    act(() => socket.emit("chat:message", incoming));
    expect(onMessage).toHaveBeenCalledWith(incoming, null);
  });

  it("connect_error define a mensagem de erro e mantém o loading por padrão", () => {
    const { result } = renderHook(() => useChatChannel(baseOptions));
    act(() => socket.emit("connect_error"));
    expect(result.current.error).toBe("falha de conexão");
    expect(result.current.loading).toBe(true);
  });

  it("connect_error encerra o loading com stopLoadingOnError", () => {
    const { result } = renderHook(() =>
      useChatChannel({ ...baseOptions, stopLoadingOnError: true }),
    );
    act(() => socket.emit("connect_error"));
    expect(result.current.loading).toBe(false);
  });

  it("não escuta exclusões nem connect sem as opções correspondentes", () => {
    renderHook(() => useChatChannel(baseOptions));
    expect(socket.listenerCount("chat:message-deleted")).toBe(0);
    expect(socket.listenerCount("connect")).toBe(0);
  });

  it("com syncDeletes remove a mensagem e avisa onDeleted", () => {
    const onDeleted = vi.fn();
    const { result } = renderHook(() =>
      useChatChannel({ ...baseOptions, syncDeletes: true, onDeleted }),
    );
    act(() =>
      socket.emit("chat:history", [
        makeChatMessage({ id: 1 }),
        makeChatMessage({ id: 2 }),
      ]),
    );
    act(() => socket.emit("chat:message-deleted", { messageId: 1 }));
    expect(result.current.messages.map((m) => m.id)).toEqual([2]);
    expect(onDeleted).toHaveBeenCalledWith(1);
  });

  it("com clearErrorOnConnect limpa o erro no connect e no session:ready", () => {
    const { result } = renderHook(() =>
      useChatChannel({ ...baseOptions, clearErrorOnConnect: true }),
    );
    act(() => socket.emit("connect_error"));
    act(() => socket.emit("connect"));
    expect(result.current.error).toBeNull();
    act(() => socket.emit("connect_error"));
    act(() => socket.emit("session:ready", makeChatSession()));
    expect(result.current.error).toBeNull();
  });

  it("session:ready não limpa o erro sem clearErrorOnConnect", () => {
    const { result } = renderHook(() => useChatChannel(baseOptions));
    act(() => socket.emit("connect_error"));
    act(() => socket.emit("session:ready", makeChatSession()));
    expect(result.current.error).toBe("falha de conexão");
  });

  it("usa o onMessage mais recente sem registrar listeners de novo", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ onMessage }) => useChatChannel({ ...baseOptions, onMessage }),
      { initialProps: { onMessage: first } },
    );
    rerender({ onMessage: second });
    act(() => socket.emit("chat:message", makeChatMessage()));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(socket.on).toHaveBeenCalledTimes(4);
  });

  it("setSelectedUnitId e setError atualizam o estado", () => {
    const { result } = renderHook(() => useChatChannel(baseOptions));
    act(() => result.current.setSelectedUnitId("20"));
    act(() => result.current.setError("x"));
    expect(result.current.selectedUnitId).toBe("20");
    expect(result.current.error).toBe("x");
  });

  it("refresh pede o histórico e volta a carregar", () => {
    const { result } = renderHook(() => useChatChannel(baseOptions));
    act(() => socket.emit("chat:history", []));
    expect(result.current.loading).toBe(false);
    act(() => result.current.refresh());
    expect(chatGateway.fetchHistory).toHaveBeenCalledWith(socket);
    expect(result.current.loading).toBe(true);
  });

  it("remove todos os listeners ao desmontar", () => {
    const { unmount } = renderHook(() =>
      useChatChannel({
        ...baseOptions,
        syncDeletes: true,
        clearErrorOnConnect: true,
      }),
    );
    expect(socket.listenerCount("chat:message")).toBe(1);
    unmount();
    [
      "session:ready",
      "chat:history",
      "chat:message",
      "connect_error",
      "chat:message-deleted",
      "connect",
    ].forEach((event) => expect(socket.listenerCount(event)).toBe(0));
  });

  describe("montando depois que o socket já conectou", () => {
    it("usa a sessão já recebida e seleciona a loja da conta", () => {
      const stored = makeChatSession({ unitStoreId: 30 });
      vi.mocked(getRealtimeSession).mockReturnValue(stored);
      const { result } = renderHook(() => useChatChannel(baseOptions));
      expect(result.current.session).toBe(stored);
      expect(result.current.selectedUnitId).toBe("30");
    });

    it("pede o histórico, que o servidor só envia na conexão", () => {
      const connected = Object.assign(createFakeSocket(), { connected: true });
      vi.mocked(useRealtimeSocket).mockReturnValue(connected as never);
      const { result } = renderHook(() => useChatChannel(baseOptions));
      expect(chatGateway.fetchHistory).toHaveBeenCalledTimes(1);
      expect(chatGateway.fetchHistory).toHaveBeenCalledWith(connected);
      expect(result.current.loading).toBe(true);
      act(() => connected.emit("chat:history", [makeChatMessage({ id: 9 })]));
      expect(result.current.messages.map((m) => m.id)).toEqual([9]);
      expect(result.current.loading).toBe(false);
    });

    it("não pede o histórico enquanto o socket ainda está conectando", () => {
      renderHook(() => useChatChannel(baseOptions));
      expect(chatGateway.fetchHistory).not.toHaveBeenCalled();
    });
  });

  describe("sem socket", () => {
    beforeEach(() => {
      vi.mocked(useRealtimeSocket).mockReturnValue(null);
    });

    it("sem token reporta erro e não carrega", () => {
      vi.mocked(authSession.isAuthenticated).mockReturnValue(false);
      const { result } = renderHook(() => useChatChannel(baseOptions));
      expect(result.current.error).toBe("sem token");
      expect(result.current.loading).toBe(false);
    });

    it("autenticado aguarda o socket sem erro", () => {
      const { result } = renderHook(() => useChatChannel(baseOptions));
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(true);
    });

    it("refresh não faz nada", () => {
      const { result } = renderHook(() => useChatChannel(baseOptions));
      act(() => result.current.refresh());
      expect(chatGateway.fetchHistory).not.toHaveBeenCalled();
    });
  });
});
