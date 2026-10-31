import httpClient from "@/shared/api/httpClient";
import type {
  DashboardMetrics,
  DashboardPerformance,
} from "../domain/dashboardMetrics";
import type { DashboardRange } from "../domain/dashboardPeriod";

export const dashboardRepository = {
  async overview(range: DashboardRange): Promise<DashboardMetrics> {
    const { data } = await httpClient.get<{ metrics: DashboardMetrics }>(
      "/dashboard/overview",
      { params: range },
    );
    return data.metrics;
  },

  async performance(range: DashboardRange): Promise<DashboardPerformance> {
    const { data } = await httpClient.get<DashboardPerformance>(
      "/dashboard/performance",
      { params: range },
    );
    return data;
  },
};
