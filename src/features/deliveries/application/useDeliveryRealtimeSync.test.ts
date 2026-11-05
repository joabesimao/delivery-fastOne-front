import { beforeEach, describe, expect, it, vi } from "vitest";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import { createFakeSocket } from "@/test/fakeSocket";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { deliveryKeys } from "./deliveryQueries";
import { useDeliveryRealtimeSync } from "./useDeliveryRealtimeSync";

vi.mock("@/shared/realtime/useRealtimeSocket", () => ({ default: vi.fn() }));

describe("useDeliveryRealtimeSync", () => {
  let socket: ReturnType<typeof createFakeSocket>;

  beforeEach(() => {
    socket = createFakeSocket();
    vi.mocked(useRealtimeSocket).mockReturnValue(socket as never);
  });

  it("registra listener de delivery:changed", () => {
    renderHookWithQueryClient(() => useDeliveryRealtimeSync());
    expect(socket.listenerCount("delivery:changed")).toBe(1);
  });

  it("invalida as entregas ao receber o evento", () => {
    const { queryClient } = renderHookWithQueryClient(() =>
      useDeliveryRealtimeSync(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    socket.emit("delivery:changed");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: deliveryKeys.all });
  });

  it("chama o callback onChange ao receber o evento", () => {
    const onChange = vi.fn();
    renderHookWithQueryClient(() => useDeliveryRealtimeSync(onChange));
    socket.emit("delivery:changed");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("usa o callback mais recente sem registrar o listener de novo", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHookWithQueryClient(
      ({ cb }) => useDeliveryRealtimeSync(cb),
      {},
      { cb: first },
    );
    rerender({ cb: second });
    socket.emit("delivery:changed");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(socket.on).toHaveBeenCalledTimes(1);
  });

  it("remove o listener ao desmontar", () => {
    const { unmount } = renderHookWithQueryClient(() =>
      useDeliveryRealtimeSync(),
    );
    unmount();
    expect(socket.listenerCount("delivery:changed")).toBe(0);
  });

  it("não falha sem socket", () => {
    vi.mocked(useRealtimeSocket).mockReturnValue(null);
    const { queryClient } = renderHookWithQueryClient(() =>
      useDeliveryRealtimeSync(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    expect(socket.on).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });
});
