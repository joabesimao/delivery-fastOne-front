import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSocket } from "@/test/fakeSocket";
import { chatGateway } from "../data/chatGateway";
import { useChatTyping } from "./useChatTyping";

vi.mock("../data/chatGateway", () => ({
  chatGateway: { setTyping: vi.fn() },
}));

describe("useChatTyping", () => {
  let socket: ReturnType<typeof createFakeSocket>;

  beforeEach(() => {
    vi.useFakeTimers();
    socket = createFakeSocket();
  });

  const render = () => renderHook(() => useChatTyping(socket as never));

  it("começa sem rótulo de digitação", () => {
    expect(render().result.current.typingLabel).toBeNull();
  });

  it("mostra o nome de quem está digitando", () => {
    const { result } = render();
    act(() =>
      socket.emit("chat:typing", {
        accountId: 2,
        name: "Maria",
        isTyping: true,
      }),
    );
    expect(result.current.typingLabel).toBe("Maria");
  });

  it("resume vários usuários com 'e outros'", () => {
    const { result } = render();
    act(() => {
      socket.emit("chat:typing", {
        accountId: 2,
        name: "Maria",
        isTyping: true,
      });
      socket.emit("chat:typing", {
        accountId: 3,
        name: "João",
        isTyping: true,
      });
    });
    expect(result.current.typingLabel).toBe("Maria e outros");
  });

  it("remove o rótulo quando o usuário para de digitar", () => {
    const { result } = render();
    act(() => {
      socket.emit("chat:typing", {
        accountId: 2,
        name: "Maria",
        isTyping: true,
      });
      socket.emit("chat:typing", {
        accountId: 2,
        name: "Maria",
        isTyping: false,
      });
    });
    expect(result.current.typingLabel).toBeNull();
  });

  it("notifyTyping avisa o início uma única vez enquanto continua digitando", () => {
    const { result } = render();
    act(() => result.current.notifyTyping());
    act(() => result.current.notifyTyping());
    expect(chatGateway.setTyping).toHaveBeenCalledTimes(1);
    expect(chatGateway.setTyping).toHaveBeenCalledWith(socket, true);
  });

  it("avisa que parou de digitar após 2s sem novas teclas", () => {
    const { result } = render();
    act(() => result.current.notifyTyping());
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(chatGateway.setTyping).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(chatGateway.setTyping).toHaveBeenLastCalledWith(socket, false);
    expect(chatGateway.setTyping).toHaveBeenCalledTimes(2);
  });

  it("nova digitação reinicia a contagem dos 2s", () => {
    const { result } = render();
    act(() => result.current.notifyTyping());
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => result.current.notifyTyping());
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(chatGateway.setTyping).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(chatGateway.setTyping).toHaveBeenCalledTimes(2);
  });

  it("stopTyping avisa imediatamente e cancela o timer", () => {
    const { result } = render();
    act(() => result.current.notifyTyping());
    act(() => result.current.stopTyping());
    expect(chatGateway.setTyping).toHaveBeenLastCalledWith(socket, false);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(chatGateway.setTyping).toHaveBeenCalledTimes(2);
  });

  it("stopTyping sem ter digitado não emite nada", () => {
    const { result } = render();
    act(() => result.current.stopTyping());
    expect(chatGateway.setTyping).not.toHaveBeenCalled();
  });

  it("sem socket não emite nem registra listener", () => {
    const { result } = renderHook(() => useChatTyping(null));
    act(() => result.current.notifyTyping());
    act(() => result.current.stopTyping());
    expect(chatGateway.setTyping).not.toHaveBeenCalled();
  });

  it("remove o listener e cancela o timer ao desmontar", () => {
    const { result, unmount } = render();
    act(() => result.current.notifyTyping());
    unmount();
    expect(socket.listenerCount("chat:typing")).toBe(0);
    vi.advanceTimersByTime(5000);
    expect(chatGateway.setTyping).toHaveBeenCalledTimes(1);
  });
});
