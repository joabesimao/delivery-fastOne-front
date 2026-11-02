import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { clientsRepository } from "./clientsRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("clientsRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("register", () => {
    it("envia POST /register e retorna só o id", async () => {
      vi.mocked(httpClient.post).mockResolvedValue({
        data: { id: 12, extra: "ignorado" },
      });
      const input = {
        client: { name: "Maria", cpf: "52998224725", phone: "81988887777" },
        address: {
          street: "Rua A",
          neighborhood: "Centro",
          numberHouse: 10,
          reference: "",
          city: "Recife",
        },
      };

      const result = await clientsRepository.register(input);

      expect(httpClient.post).toHaveBeenCalledWith("/register", input);
      expect(result).toEqual({ id: 12 });
    });
  });

  describe("listRegisters", () => {
    it("mapeia registers completos", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          {
            id: 3,
            client: { name: "Maria", phone: "81988887777" },
            address: {
              street: "Rua A",
              neighborhood: "Centro",
              numberHouse: 12,
              reference: null,
              city: "Recife",
            },
          },
        ],
      });

      const result = await clientsRepository.listRegisters();

      expect(httpClient.get).toHaveBeenCalledWith("/register");
      expect(result).toEqual([
        {
          id: 3,
          name: "Maria",
          phone: "81988887777",
          address: {
            street: "Rua A",
            neighborhood: "Centro",
            numberHouse: "12",
            reference: "",
            city: "Recife",
          },
        },
      ]);
    });

    it("descarta registers sem client, sem address ou nulos", async () => {
      const complete = {
        id: 1,
        client: { name: "A", phone: "1" },
        address: {
          street: "s",
          neighborhood: "n",
          numberHouse: "1",
          city: "c",
        },
      };
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          { id: 2, address: complete.address },
          { id: 3, client: complete.client },
          null,
          complete,
        ],
      });

      const result = await clientsRepository.listRegisters();

      expect(result.map((r) => r.id)).toEqual([1]);
    });

    it("retorna lista vazia quando o payload não é array", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: null });

      expect(await clientsRepository.listRegisters()).toEqual([]);
    });
  });
});
