import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotifications } from "@/features/notifications";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import { session as authSession } from "@/shared/session/session";
import { makeChatMessage, makeChatSession } from "@/test/chatFixtures";
import { createFakeSocket } from "@/test/fakeSocket";
import { useChatWidget } from "./useChatWidget";

vi.mock("@/shared/realtime/useRealtimeSocket", () => ({ default: vi.fn() }));
vi.mock("@/shared/session/session", () => ({
  session: { isAuthenticated: vi.fn(() => true) },
}));
vi.mock("@/features/notifications", () => ({ useNotifications: vi.fn() }));
vi.mock("../data/chatGateway", () => ({
  chatGateway: { send: vi.fn(), fetchHistory: vi.fn() },
}));

describe("useChatWidget", () => {
  let socket: ReturnType<typeof createFakeSocket>;
  let setChatWidgetOpen: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    socket = createFakeSocket();
    setChatWidgetOpen = vi.fn();
    vi.mocked(useRealtimeSocket).mockReturnValue(socket as never);
    vi.mocked(authSession.isAuthenticated).mockReturnValue(true);
    vi.mocked(useNotifications).mockReturnValue({ setChatWidgetOpen } as never);
  });

  const renderReady = () => {
    const hook = renderHook(() => useChatWidget());
    act(() =>
      socket.emit("session:ready", makeChatSession({ unitStoreId: 10 })),
    );
    return hook;
  };

  const receive = (overrides = {}) =>
    act(() => socket.emit("chat:message", makeChatMessage(overrides)));

  it("começa fechado e sem não lidas", () => {
    const { result } = renderReady();
    expect(result.current.open).toBe(false);
    expect(result.current.unreadTotal).toBe(0);
    expect(result.current.unreadByStore).toEqual({});
  });

  it("abrir e fechar alteram open e avisam o contexto de notificações", () => {
    const { result } = renderReady();
    act(() => result.current.openWidget());
    expect(result.current.open).toBe(true);
    expect(setChatWidgetOpen).toHaveBeenLastCalledWith(true);
    act(() => result.current.closeWidget());
    expect(result.current.open).toBe(false);
    expect(setChatWidgetOpen).toHaveBeenLastCalledWith(false);
  });

  it("marca o widget como fechado nas notificações ao desmontar", () => {
    const { result, unmount } = renderReady();
    act(() => result.current.openWidget());
    unmount();
    expect(setChatWidgetOpen).toHaveBeenLastCalledWith(false);
  });

  it("mensagem de outra pessoa com o widget fechado conta como não lida", () => {
    const { result } = renderReady();
    receive({ id: 1, unitStoreId: 10 });
    receive({ id: 2, unitStoreId: 20 });
    receive({ id: 3, unitStoreId: 20 });
    expect(result.current.unreadByStore).toEqual({ 10: 1, 20: 2 });
    expect(result.current.unreadTotal).toBe(3);
  });

  it("mensagem enviada por mim não conta como não lida", () => {
    const { result } = renderReady();
    receive({
      sender: { ...makeChatMessage().sender, id: 1 },
    });
    expect(result.current.unreadTotal).toBe(0);
  });

  it("com o widget aberto na loja da mensagem não conta como não lida", () => {
    const { result } = renderReady();
    act(() => result.current.openWidget());
    receive({ unitStoreId: 10 });
    expect(result.current.unreadTotal).toBe(0);
  });

  it("com o widget aberto, mensagem de outra loja conta como não lida", () => {
    const { result } = renderReady();
    act(() => result.current.openWidget());
    receive({ unitStoreId: 20 });
    expect(result.current.unreadByStore).toEqual({ 20: 1 });
  });

  it("abrir o widget zera as não lidas da loja selecionada", () => {
    const { result } = renderReady();
    receive({ id: 1, unitStoreId: 10 });
    receive({ id: 2, unitStoreId: 20 });
    act(() => result.current.openWidget());
    expect(result.current.unreadByStore).toEqual({ 10: 0, 20: 1 });
    expect(result.current.unreadTotal).toBe(1);
  });

  it("trocar de loja seleciona a nova e zera as não lidas dela", () => {
    const { result } = renderReady();
    receive({ id: 1, unitStoreId: 20 });
    act(() => result.current.openWidget());
    act(() => result.current.changeStore("20"));
    expect(result.current.channel.selectedUnitId).toBe("20");
    expect(result.current.unreadByStore[20]).toBe(0);
    expect(result.current.unreadTotal).toBe(0);
  });

  it("trocar de loja com o widget fechado também zera as não lidas dela", () => {
    const { result } = renderReady();
    receive({ id: 1, unitStoreId: 20 });
    act(() => result.current.changeStore("20"));
    expect(result.current.unreadTotal).toBe(0);
  });

  it("expõe o composer ligado ao socket e à loja selecionada", () => {
    const { result } = renderReady();
    act(() => result.current.composer.setText("oi"));
    expect(result.current.composer.canSend).toBe(true);
  });

  it("erro de conexão para o loading", () => {
    const { result } = renderHook(() => useChatWidget());
    act(() => socket.emit("connect_error"));
    expect(result.current.channel.loading).toBe(false);
    expect(result.current.channel.error).toBe(
      "Falha ao conectar no chat em tempo real.",
    );
  });
});
