import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { productsRepository } from "../data/productsRepository";
import {
  productKeys,
  useCatalogSample,
  useCreateProduct,
  useDeleteProduct,
  useProductPage,
  useUpdateProduct,
} from "./productQueries";

vi.mock("../data/productsRepository", () => ({
  productsRepository: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("productKeys", () => {
  it("inclui os parâmetros na key da lista", () => {
    const params = { limit: 10, offset: 20 } as never;
    expect(productKeys.all).toEqual(["products"]);
    expect(productKeys.list(params)).toEqual(["products", "list", params]);
  });
});

describe("consultas de produtos", () => {
  it("useProductPage consulta o repositório com os parâmetros", async () => {
    const page = { items: [{ id: 1 }], total: 1 };
    vi.mocked(productsRepository.list).mockResolvedValue(page as never);
    const params = { limit: 10, offset: 0 } as never;
    const { result } = renderHookWithQueryClient(() => useProductPage(params));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(productsRepository.list).toHaveBeenCalledWith(params);
    expect(result.current.data).toBe(page);
  });

  it("useCatalogSample pede as 100 primeiras linhas", async () => {
    vi.mocked(productsRepository.list).mockResolvedValue({} as never);
    const { result } = renderHookWithQueryClient(() => useCatalogSample());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(productsRepository.list).toHaveBeenCalledWith({
      limit: 100,
      offset: 0,
    });
  });

  it("mantém os dados anteriores enquanto carrega novos parâmetros", async () => {
    const first = { items: [{ id: 1 }] };
    vi.mocked(productsRepository.list)
      .mockResolvedValueOnce(first as never)
      .mockReturnValueOnce(new Promise(() => undefined));
    const { result, rerender } = renderHookWithQueryClient(
      ({ offset }) => useProductPage({ limit: 10, offset } as never),
      {},
      { offset: 0 },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ offset: 10 });
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(true));
    expect(result.current.data).toBe(first);
  });
});

describe("mutações de produtos", () => {
  it("useCreateProduct cria e invalida", async () => {
    vi.mocked(productsRepository.create).mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useCreateProduct(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const input = { name: "P" } as never;
    await act(() => result.current.mutateAsync(input));
    expect(productsRepository.create).toHaveBeenCalledWith(input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.all });
  });

  it("useUpdateProduct atualiza com id e input", async () => {
    vi.mocked(productsRepository.update).mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useUpdateProduct(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const input = { name: "Q" } as never;
    await act(() => result.current.mutateAsync({ id: 2, input }));
    expect(productsRepository.update).toHaveBeenCalledWith(2, input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.all });
  });

  it("useDeleteProduct remove pelo id", async () => {
    vi.mocked(productsRepository.remove).mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useDeleteProduct(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() => result.current.mutateAsync(4));
    expect(productsRepository.remove).toHaveBeenCalledWith(4);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.all });
  });

  it("não invalida quando a remoção falha", async () => {
    vi.mocked(productsRepository.remove).mockRejectedValue(new Error("x"));
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useDeleteProduct(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() => result.current.mutateAsync(4).catch(() => undefined));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
