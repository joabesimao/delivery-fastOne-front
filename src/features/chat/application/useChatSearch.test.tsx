import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeChatMessage } from "@/test/chatFixtures";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { chatGateway } from "../data/chatGateway";
import {
  chatKeys,
  useChatSearch,
  useRemoveFromChatSearch,
} from "./useChatSearch";

vi.mock("../data/chatGateway", () => ({
  chatGateway: { search: vi.fn() },
}));

describe("useChatSearch", () => {
  beforeEach(() => {
    vi.mocked(chatGateway.search).mockResolvedValue([]);
  });

  afterEach(() => vi.useRealTimers());

  it("sem termo ou sem conta fica inativo com resultados nulos", () => {
    const empty = renderHookWithQueryClient(() => useChatSearch("  ", 1));
    expect(empty.result.current).toEqual({ searching: false, results: null });
    const noAccount = renderHookWithQueryClient(() =>
      useChatSearch("oi", undefined),
    );
    expect(noAccount.result.current.results).toBeNull();
    expect(chatGateway.search).not.toHaveBeenCalled();
  });

  it("aguarda o debounce de 350ms antes de buscar com o termo aparado", async () => {
    vi.useFakeTimers();
    const found = [makeChatMessage({ id: 5 })];
    vi.mocked(chatGateway.search).mockResolvedValue(found);
    const { result, rerender } = renderHookWithQueryClient(
      ({ query }) => useChatSearch(query, 7),
      {},
      { query: "" },
    );
    rerender({ query: "  pedido " });
    expect(result.current.searching).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(349);
    });
    expect(chatGateway.search).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(chatGateway.search).toHaveBeenCalledWith("pedido", 7);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.results).toEqual(found);
    expect(result.current.searching).toBe(false);
  });

  it("erro na busca resulta em lista vazia", async () => {
    vi.mocked(chatGateway.search).mockRejectedValue(new Error("falhou"));
    const { result } = renderHookWithQueryClient(() => useChatSearch("oi", 1));
    await waitFor(() => {
      expect(chatGateway.search).toHaveBeenCalled();
      expect(result.current.searching).toBe(false);
    });
    expect(result.current.results).toEqual([]);
  });
});

describe("useRemoveFromChatSearch", () => {
  it("remove a mensagem de todas as buscas em cache", () => {
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useRemoveFromChatSearch(),
    );
    queryClient.setQueryData(chatKeys.search("a", 1), [
      makeChatMessage({ id: 1 }),
      makeChatMessage({ id: 2 }),
    ]);
    queryClient.setQueryData(chatKeys.search("b", 1), [
      makeChatMessage({ id: 2 }),
    ]);
    act(() => result.current(2));
    expect(
      queryClient.getQueryData<{ id: number }[]>(chatKeys.search("a", 1)),
    ).toEqual([expect.objectContaining({ id: 1 })]);
    expect(queryClient.getQueryData(chatKeys.search("b", 1))).toEqual([]);
  });
});
