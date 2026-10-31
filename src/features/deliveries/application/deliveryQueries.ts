import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateDeliveryInput } from "../domain/deliveryOrder";
import {
  RANKING_EXPORT_PAGE_SIZE,
  type RankingFilters,
  type RankingItem,
  type RankingQuery,
} from "../domain/deliverymanRanking";
import type { FinishDeliveryInput } from "../domain/finishDelivery";
import { deliveriesRepository } from "../data/deliveriesRepository";

export const deliveryKeys = {
  all: ["deliveries"] as const,
  list: () => [...deliveryKeys.all, "list"] as const,
  ranking: (query: RankingQuery) =>
    [...deliveryKeys.all, "ranking", query] as const,
};

const useInvalidateDeliveries = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
};

export const useDeliveries = () =>
  useQuery({
    queryKey: deliveryKeys.list(),
    queryFn: () => deliveriesRepository.list(),
  });

export const useCreateDelivery = () => {
  const invalidate = useInvalidateDeliveries();
  return useMutation({
    mutationFn: (input: CreateDeliveryInput) =>
      deliveriesRepository.create(input),
    onSuccess: invalidate,
  });
};

export const useFinishDelivery = () => {
  const invalidate = useInvalidateDeliveries();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: FinishDeliveryInput }) =>
      deliveriesRepository.finish(id, input),
    onSuccess: invalidate,
  });
};

export const useDeliverymanRanking = (query: RankingQuery) =>
  useQuery({
    queryKey: deliveryKeys.ranking(query),
    queryFn: () => deliveriesRepository.ranking(query),
  });

export const fetchFullRanking = async (
  filters: RankingFilters,
): Promise<RankingItem[]> => {
  const items: RankingItem[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const result = await deliveriesRepository.ranking({
      ...filters,
      pageSize: RANKING_EXPORT_PAGE_SIZE,
      page,
    });
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }
  return items;
};
