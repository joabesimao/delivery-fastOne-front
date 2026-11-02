import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { clientsListRepository } from "./clientsListRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("clientsListRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("list", () => {
    it("busca /client e mapeia o DTO completo", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          {
            id: 1,
            name: "Maria",
            cpf: "52998224725",
            phone: "81988887777",
            status: true,
            Register: {
              addressId: 30,
              address: {
                id: 99,
                street: "Rua A",
                neighborhood: "Centro",
                numberHouse: 12,
                reference: "Perto",
                city: "Recife",
              },
            },
          },
        ],
      });

      const result = await clientsListRepository.list();

      expect(httpClient.get).toHaveBeenCalledWith("/client");
      expect(result).toEqual([
        {
          id: 1,
          name: "Maria",
          cpf: "52998224725",
          phone: "81988887777",
          active: true,
          address: {
            id: 30,
            street: "Rua A",
            neighborhood: "Centro",
            numberHouse: "12",
            reference: "Perto",
            city: "Recife",
          },
        },
      ]);
    });

    it("status ausente é ativo e só status false é inativo", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          { id: 1, name: "A", phone: "1" },
          { id: 2, name: "B", phone: "2", status: false },
          { id: 3, name: "C", phone: "3", status: true },
        ],
      });

      const result = await clientsListRepository.list();

      expect(result.map((c) => c.active)).toEqual([true, false, true]);
    });

    it("cpf vazio ou nulo vira null", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          { id: 1, name: "A", phone: "1", cpf: "" },
          { id: 2, name: "B", phone: "2", cpf: null },
        ],
      });

      const result = await clientsListRepository.list();

      expect(result.map((c) => c.cpf)).toEqual([null, null]);
    });

    it("sem Register ou sem address o endereço é null", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          { id: 1, name: "A", phone: "1" },
          { id: 2, name: "B", phone: "2", Register: { address: null } },
        ],
      });

      const result = await clientsListRepository.list();

      expect(result.map((c) => c.address)).toEqual([null, null]);
    });

    it("usa address.id quando não há addressId e null quando nenhum existe", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          { id: 1, name: "A", phone: "1", Register: { address: { id: 7 } } },
          { id: 2, name: "B", phone: "2", Register: { address: {} } },
        ],
      });

      const result = await clientsListRepository.list();

      expect(result[0].address?.id).toBe(7);
      expect(result[1].address).toEqual({
        id: null,
        street: "",
        neighborhood: "",
        numberHouse: "",
        reference: "",
        city: "",
      });
    });

    it("retorna lista vazia quando o payload não é array", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: null });

      expect(await clientsListRepository.list()).toEqual([]);
    });
  });

  describe("update", () => {
    it("faz PUT do cliente e depois PUT do endereço, nessa ordem", async () => {
      vi.mocked(httpClient.put).mockResolvedValue({ data: {} });
      const input = {
        client: { name: "Maria", phone: "81988887777" },
        address: {
          street: "Rua A",
          neighborhood: "Centro",
          city: "Recife",
          numberHouse: 10,
          reference: "",
        },
      };

      await clientsListRepository.update(1, 30, input);

      expect(httpClient.put).toHaveBeenNthCalledWith(
        1,
        "/client/1",
        input.client,
      );
      expect(httpClient.put).toHaveBeenNthCalledWith(
        2,
        "/address/30",
        input.address,
      );
      expect(httpClient.put).toHaveBeenCalledTimes(2);
    });

    it("não atualiza o endereço se a atualização do cliente falhar", async () => {
      vi.mocked(httpClient.put).mockRejectedValueOnce(new Error("falhou"));

      await expect(
        clientsListRepository.update(1, 30, {
          client: { name: "A", phone: "1" },
          address: {
            street: "",
            neighborhood: "",
            city: "",
            numberHouse: 1,
            reference: "",
          },
        }),
      ).rejects.toThrow("falhou");

      expect(httpClient.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("setActive", () => {
    it("envia PUT /client/:id com status", async () => {
      vi.mocked(httpClient.put).mockResolvedValue({ data: {} });

      await clientsListRepository.setActive(4, false);

      expect(httpClient.put).toHaveBeenCalledWith("/client/4", {
        status: false,
      });
    });
  });
});
