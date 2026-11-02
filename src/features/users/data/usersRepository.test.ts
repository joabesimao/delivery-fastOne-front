import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { usersRepository } from "./usersRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("usersRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("list", () => {
    it("busca /account repassando os parâmetros", async () => {
      const users = [{ id: 1, name: "Ana" }];
      vi.mocked(httpClient.get).mockResolvedValue({ data: users });

      const result = await usersRepository.list({ q: "ana" });

      expect(httpClient.get).toHaveBeenCalledWith("/account", {
        params: { q: "ana" },
      });
      expect(result).toEqual(users);
    });

    it.each([[null], [undefined], [{}]])(
      "devolve lista vazia quando a resposta não é array (%j)",
      async (data) => {
        vi.mocked(httpClient.get).mockResolvedValue({ data });
        expect(await usersRepository.list({})).toEqual([]);
      },
    );

    it("propaga erro de rede", async () => {
      vi.mocked(httpClient.get).mockRejectedValue(new Error("falhou"));
      await expect(usersRepository.list({})).rejects.toThrow("falhou");
    });
  });

  it("create envia POST em /account/staff", async () => {
    const input = { name: "A", email: "a@x.com", role: "user" as const };
    await usersRepository.create(input);
    expect(httpClient.post).toHaveBeenCalledWith("/account/staff", input);
  });

  it("update envia PUT em /account/:id", async () => {
    const input = { name: "A", email: "a@x.com", role: "admin" as const };
    await usersRepository.update(7, input);
    expect(httpClient.put).toHaveBeenCalledWith("/account/7", input);
  });

  it("setActive envia apenas o campo active", async () => {
    await usersRepository.setActive(7, false);
    expect(httpClient.put).toHaveBeenCalledWith("/account/7", {
      active: false,
    });
  });

  it("remove envia DELETE em /account/:id", async () => {
    await usersRepository.remove(7);
    expect(httpClient.delete).toHaveBeenCalledWith("/account/7");
  });
});
