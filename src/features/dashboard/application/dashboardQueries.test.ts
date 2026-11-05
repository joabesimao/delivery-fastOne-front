import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deliveryKeys, useDeliverymanRanking } from "@/features/deliveries";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import { createFakeSocket } from "@/test/fakeSocket";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { dashboardRepository } from "../data/dashboardRepository";
import {
  dashboardKeys,
  useDashboardRealtimeSync,
  useDashboardSummary,
} from "./dashboardQueries";

vi.mock("@/features/deliveries", async () => ({
  deliveryKeys: (
    await import("@/features/deliveries/application/deliveryQueries")
  ).deliveryKeys,
  useDeliverymanRanking: vi.fn(),
  useDeliveryRealtimeSync: (
    await import("@/features/deliveries/application/useDeliveryRealtimeSync")
  ).useDeliveryRealtimeSync,
}));

vi.mock("@/shared/realtime/useRealtimeSocket", () => ({ default: vi.fn() }));

vi.mock("../data/dashboardRepository", () => ({
  dashboardRepository: { overview: vi.fn(), performance: vi.fn() },
}));

const range = {
  startDate: "2025-03-01T03:00:00.000Z",
  endDate: "2025-03-02T02:59:59.999Z",
};

const rankingResult = (overrides: Record<string, unknown>) =>
  ({
    data: undefined,
    isPending: false,
    isError: false,
    ...overrides,
  }) as never;

describe("dashboardKeys", () => {
  it("inclui o período nas keys", () => {
    expect(dashboardKeys.overview(range)).toEqual([
      "dashboard",
      "overview",
      range,
    ]);
    expect(dashboardKeys.performance(range)).toEqual([
      "dashboard",
      "performance",
      range,
    ]);
  });
});

describe("useDashboardSummary", () => {
  const metrics = { totalOrders: 10 };
  const performance = { onTime: 90 };
  const items = [
    { deliverymanId: 1, deliverymanName: "Ana", totalDeliveries: 4 },
  ];

  beforeEach(() => {
    vi.mocked(dashboardRepository.overview).mockResolvedValue(metrics as never);
    vi.mocked(dashboardRepository.performance).mockResolvedValue(
      performance as never,
    );
    vi.mocked(useDeliverymanRanking).mockReturnValue(
      rankingResult({ data: { items } }),
    );
  });

  it("combina overview, performance e ranking", async () => {
    const { result } = renderHookWithQueryClient(() =>
      useDashboardSummary(range),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.metrics).toEqual(metrics);
    expect(result.current.performance).toEqual(performance);
    expect(result.current.ranking).toEqual(items);
    expect(result.current.error).toBe(false);
    expect(dashboardRepository.overview).toHaveBeenCalledWith(range);
    expect(dashboardRepository.performance).toHaveBeenCalledWith(range);
  });

  it("pede o top 3 do ranking sem filtro de status", () => {
    renderHookWithQueryClient(() => useDashboardSummary(range));
    expect(useDeliverymanRanking).toHaveBeenCalledWith({
      ...range,
      status: "all",
      page: 1,
      pageSize: 3,
    });
  });

  it("fica em loading enquanto alguma consulta está pendente", async () => {
    vi.mocked(useDeliverymanRanking).mockReturnValue(
      rankingResult({ isPending: true }),
    );
    const { result } = renderHookWithQueryClient(() =>
      useDashboardSummary(range),
    );
    await waitFor(() => expect(result.current.metrics).toEqual(metrics));
    expect(result.current.loading).toBe(true);
    expect(result.current.ranking).toEqual([]);
  });

  it("sinaliza erro quando alguma consulta falha", async () => {
    vi.mocked(dashboardRepository.overview).mockRejectedValue(new Error("x"));
    const { result } = renderHookWithQueryClient(() =>
      useDashboardSummary(range),
    );
    await waitFor(() => expect(result.current.error).toBe(true));
  });

  it("sinaliza erro quando o ranking falha", () => {
    vi.mocked(useDeliverymanRanking).mockReturnValue(
      rankingResult({ isError: true }),
    );
    const { result } = renderHookWithQueryClient(() =>
      useDashboardSummary(range),
    );
    expect(result.current.error).toBe(true);
  });
});

describe("useDashboardRealtimeSync", () => {
  it("invalida dashboard e entregas no evento delivery:changed", () => {
    const socket = createFakeSocket();
    vi.mocked(useRealtimeSocket).mockReturnValue(socket as never);
    const { queryClient } = renderHookWithQueryClient(() =>
      useDashboardRealtimeSync(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    socket.emit("delivery:changed");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: deliveryKeys.all });
  });

  it("não invalida nada antes do evento", () => {
    vi.mocked(useRealtimeSocket).mockReturnValue(createFakeSocket() as never);
    const { queryClient } = renderHookWithQueryClient(() =>
      useDashboardRealtimeSync(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    expect(invalidate).not.toHaveBeenCalled();
  });
});
