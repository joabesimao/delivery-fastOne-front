import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { searchRepository } from "../data/searchRepository";
import { useGlobalSearch } from "./useGlobalSearch";

vi.mock("../data/searchRepository", () => ({
  searchRepository: { search: vi.fn() },
}));

const results = { orders: [], clients: [] };

describe("useGlobalSearch", () => {
  beforeEach(() => {
    vi.mocked(searchRepository.search).mockResolvedValue(results as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("não busca com termo menor que o mínimo", async () => {
    vi.useFakeTimers();
    const { result } = renderHookWithQueryClient(() => useGlobalSearch("a"));
    await vi.advanceTimersByTimeAsync(500);
    expect(searchRepository.search).not.toHaveBeenCalled();
    expect(result.current.results).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("aguarda o debounce antes de buscar", async () => {
    vi.useFakeTimers();
    const { rerender } = renderHookWithQueryClient(
      ({ term }) => useGlobalSearch(term),
      {},
      { term: "" },
    );
    rerender({ term: "ana" });
    await vi.advanceTimersByTimeAsync(299);
    expect(searchRepository.search).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(searchRepository.search).toHaveBeenCalledWith("ana");
  });

  it("busca com o termo sem espaços nas pontas e retorna os resultados", async () => {
    const { result } = renderHookWithQueryClient(() =>
      useGlobalSearch("  ana  "),
    );
    await waitFor(() => expect(result.current.results).toEqual(results));
    expect(searchRepository.search).toHaveBeenCalledWith("ana");
  });

  it("retorna null quando a busca falha", async () => {
    vi.mocked(searchRepository.search).mockRejectedValue(new Error("x"));
    const { result } = renderHookWithQueryClient(() => useGlobalSearch("ana"));
    await waitFor(() =>
      expect(searchRepository.search).toHaveBeenCalledTimes(1),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toBeNull();
  });
});
