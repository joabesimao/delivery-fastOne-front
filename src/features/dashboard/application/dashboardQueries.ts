import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useDeliverymanRanking,
  useDeliveryRealtimeSync,
} from "@/features/deliveries";
import type { DashboardRange } from "../domain/dashboardPeriod";
import { dashboardRepository } from "../data/dashboardRepository";

const TOP_DELIVERYMEN = 3;

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (range: DashboardRange) =>
    [...dashboardKeys.all, "overview", range] as const,
  performance: (range: DashboardRange) =>
    [...dashboardKeys.all, "performance", range] as const,
};

export const useDashboardSummary = (range: DashboardRange) => {
  const overview = useQuery({
    queryKey: dashboardKeys.overview(range),
    queryFn: () => dashboardRepository.overview(range),
  });
  const performance = useQuery({
    queryKey: dashboardKeys.performance(range),
    queryFn: () => dashboardRepository.performance(range),
  });
  const ranking = useDeliverymanRanking({
    ...range,
    status: "all",
    page: 1,
    pageSize: TOP_DELIVERYMEN,
  });
  const queries = [overview, performance, ranking];

  return {
    metrics: overview.data,
    performance: performance.data,
    ranking: ranking.data?.items ?? [],
    loading: queries.some((query) => query.isPending),
    error: queries.some((query) => query.isError),
  };
};

export const useDashboardRealtimeSync = () => {
  const queryClient = useQueryClient();
  useDeliveryRealtimeSync(() => {
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  });
};
