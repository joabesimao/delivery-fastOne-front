import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { createCrudRepository } from "./createCrudRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

interface Dto {
  id: number;
  name: string;
}

const repository = createCrudRepository<Dto, string, { name: string }>(
  "/items",
  (dto) => dto.name,
);

describe("createCrudRepository", () => {
  beforeEach(() => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: [] });
  });

  it("list repassa os filtros e mapeia as entidades", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
      ],
    });

    const result = await repository.list({ status: "ativo" });

    expect(httpClient.get).toHaveBeenCalledWith("/items", {
      params: { status: "ativo" },
    });
    expect(result).toEqual(["a", "b"]);
  });

  it("list retorna lista vazia quando o payload não é array", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: { message: "x" } });

    expect(await repository.list()).toEqual([]);
  });

  it("create faz POST com o input", async () => {
    await repository.create({ name: "novo" });

    expect(httpClient.post).toHaveBeenCalledWith("/items", { name: "novo" });
  });

  it("update faz PUT no path com o id", async () => {
    await repository.update(5, { name: "editado" });

    expect(httpClient.put).toHaveBeenCalledWith("/items/5", {
      name: "editado",
    });
  });

  it("remove faz DELETE no path com o id", async () => {
    await repository.remove(9);

    expect(httpClient.delete).toHaveBeenCalledWith("/items/9");
  });
});
