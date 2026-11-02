import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { dashboardRepository } from "./dashboardRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const range = {
  startDate: "2025-03-01T03:00:00.000Z",
  endDate: "2025-03-02T02:59:59.999Z",
};

describe("dashboardRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("overview envia o período e devolve apenas metrics", async () => {
    const metrics = { clients: 4, deliveredRevenue: 10 };
    vi.mocked(httpClient.get).mockResolvedValue({ data: { metrics } });

    const result = await dashboardRepository.overview(range);

    expect(httpClient.get).toHaveBeenCalledWith("/dashboard/overview", {
      params: range,
    });
    expect(result).toBe(metrics);
  });

  it("performance envia o período e devolve o payload", async () => {
    const data = { days: [], totalOrders: 0 };
    vi.mocked(httpClient.get).mockResolvedValue({ data });

    const result = await dashboardRepository.performance(range);

    expect(httpClient.get).toHaveBeenCalledWith("/dashboard/performance", {
      params: range,
    });
    expect(result).toBe(data);
  });

  it("propaga erros da requisição", async () => {
    vi.mocked(httpClient.get).mockRejectedValue(new Error("falhou"));

    await expect(dashboardRepository.overview(range)).rejects.toThrow("falhou");
  });
});
