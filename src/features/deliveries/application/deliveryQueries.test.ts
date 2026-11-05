import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { deliveriesRepository } from "../data/deliveriesRepository";
import type { RankingPage } from "../domain/deliverymanRanking";
import {
  deliveryKeys,
  fetchFullRanking,
  useCreateDelivery,
  useDeliveries,
  useDeliverymanRanking,
  useFinishDelivery,
} from "./deliveryQueries";

vi.mock("../data/deliveriesRepository", () => ({
  deliveriesRepository: {
    list: vi.fn(),
    create: vi.fn(),
    finish: vi.fn(),
    ranking: vi.fn(),
  },
}));

const filters = {
  startDate: "2025-03-01",
  endDate: "2025-03-02",
  status: "all" as const,
  pageSize: 3,
};

const query = { ...filters, page: 1 };

const rankingPage = (
  page: number,
  totalPages: number,
  ids: number[],
): RankingPage => ({
  page,
  totalPages,
  totalItems: 0,
  totalDeliveries: 0,
  items: ids.map((deliverymanId) => ({
    deliverymanId,
    deliverymanName: `D${deliverymanId}`,
    totalDeliveries: 1,
  })),
});

describe("deliveryKeys", () => {
  it("monta as keys a partir de all", () => {
    expect(deliveryKeys.all).toEqual(["deliveries"]);
    expect(deliveryKeys.list()).toEqual(["deliveries", "list"]);
    expect(deliveryKeys.ranking(query)).toEqual([
      "deliveries",
      "ranking",
      query,
    ]);
  });
});

describe("useDeliveries", () => {
  it("retorna a lista do repositório", async () => {
    vi.mocked(deliveriesRepository.list).mockResolvedValue([
      { id: 1 },
    ] as never);
    const { result } = renderHookWithQueryClient(() => useDeliveries());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1 }]);
  });
});

describe("useDeliverymanRanking", () => {
  it("consulta o ranking com os parâmetros recebidos", async () => {
    const page = rankingPage(1, 1, [5]);
    vi.mocked(deliveriesRepository.ranking).mockResolvedValue(page);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useDeliverymanRanking(query),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deliveriesRepository.ranking).toHaveBeenCalledWith(query);
    expect(queryClient.getQueryData(deliveryKeys.ranking(query))).toBe(page);
  });
});

describe("mutações de entrega", () => {
  it("useCreateDelivery cria e invalida as entregas", async () => {
    vi.mocked(deliveriesRepository.create).mockResolvedValue(
      undefined as never,
    );
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useCreateDelivery(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const input = { orderId: 1 } as never;
    await act(() => result.current.mutateAsync(input));
    expect(deliveriesRepository.create).toHaveBeenCalledWith(input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: deliveryKeys.all });
  });

  it("useFinishDelivery finaliza com id e input e invalida", async () => {
    vi.mocked(deliveriesRepository.finish).mockResolvedValue(
      undefined as never,
    );
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useFinishDelivery(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const input = { paymentMethod: "pix" } as never;
    await act(() => result.current.mutateAsync({ id: 3, input }));
    expect(deliveriesRepository.finish).toHaveBeenCalledWith(3, input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: deliveryKeys.all });
  });

  it("não invalida quando a criação falha", async () => {
    vi.mocked(deliveriesRepository.create).mockRejectedValue(new Error("x"));
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useCreateDelivery(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() =>
      result.current.mutateAsync({} as never).catch(() => undefined),
    );
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe("fetchFullRanking", () => {
  it("percorre todas as páginas e concatena os itens", async () => {
    vi.mocked(deliveriesRepository.ranking)
      .mockResolvedValueOnce(rankingPage(1, 2, [1, 2]))
      .mockResolvedValueOnce(rankingPage(2, 2, [3]));
    const items = await fetchFullRanking(filters);
    expect(items.map((item) => item.deliverymanId)).toEqual([1, 2, 3]);
    expect(deliveriesRepository.ranking).toHaveBeenNthCalledWith(1, {
      ...filters,
      pageSize: 100,
      page: 1,
    });
    expect(deliveriesRepository.ranking).toHaveBeenNthCalledWith(2, {
      ...filters,
      pageSize: 100,
      page: 2,
    });
  });

  it("faz uma única chamada quando há uma página", async () => {
    vi.mocked(deliveriesRepository.ranking).mockResolvedValue(
      rankingPage(1, 1, [1]),
    );
    await fetchFullRanking(filters);
    expect(deliveriesRepository.ranking).toHaveBeenCalledTimes(1);
  });

  it("propaga o erro do repositório", async () => {
    vi.mocked(deliveriesRepository.ranking).mockRejectedValue(new Error("x"));
    await expect(fetchFullRanking(filters)).rejects.toThrow("x");
  });
});
