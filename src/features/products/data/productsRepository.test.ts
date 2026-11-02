import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import type { ProductInput } from "../domain/product";
import { productsRepository } from "./productsRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const input = { name: "Pizza", price: 10 } as ProductInput;

describe("productsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("repassa os parâmetros e devolve itens e total", async () => {
      const items = [{ id: 1 }, { id: 2 }];
      vi.mocked(httpClient.get).mockResolvedValue({
        data: { items, pagination: { total: 42 } },
      });

      const result = await productsRepository.list({ limit: 10, offset: 0 });

      expect(httpClient.get).toHaveBeenCalledWith("/product", {
        params: { limit: 10, offset: 0 },
      });
      expect(result).toEqual({ items, total: 42 });
    });

    it("retorna página vazia quando o payload é inválido", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: { items: "x" },
      });

      expect(await productsRepository.list({})).toEqual({
        items: [],
        total: 0,
      });
    });

    it("retorna página vazia quando não há data", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: undefined });

      expect(await productsRepository.list({})).toEqual({
        items: [],
        total: 0,
      });
    });
  });

  it("create envia o input e devolve o produto criado", async () => {
    const created = { id: 1 };
    vi.mocked(httpClient.post).mockResolvedValue({ data: created });

    const result = await productsRepository.create(input);

    expect(httpClient.post).toHaveBeenCalledWith("/product", input);
    expect(result).toBe(created);
  });

  it("update usa PUT com o id e devolve o produto", async () => {
    const updated = { id: 3 };
    vi.mocked(httpClient.put).mockResolvedValue({ data: updated });

    const result = await productsRepository.update(3, input);

    expect(httpClient.put).toHaveBeenCalledWith("/product/3", input);
    expect(result).toBe(updated);
  });

  it("remove chama DELETE com o id", async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({});

    await productsRepository.remove(3);

    expect(httpClient.delete).toHaveBeenCalledWith("/product/3");
  });

  it("propaga erros da requisição", async () => {
    vi.mocked(httpClient.post).mockRejectedValue(new Error("falhou"));

    await expect(productsRepository.create(input)).rejects.toThrow("falhou");
  });
});
