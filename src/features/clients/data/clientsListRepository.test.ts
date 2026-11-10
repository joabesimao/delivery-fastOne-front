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
              id: 40,
              address: {
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
          registerId: 40,
          address: {
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

    it("registerId é null sem Register e endereço vazio vira campos vazios", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          { id: 1, name: "A", phone: "1" },
          { id: 2, name: "B", phone: "2", Register: { id: 9, address: {} } },
        ],
      });

      const result = await clientsListRepository.list();

      expect(result[0].registerId).toBeNull();
      expect(result[1].registerId).toBe(9);
      expect(result[1].address).toEqual({
        street: "",
        neighborhood: "",
        numberHouse: "",
        reference: "",
        city: "",
      });
    });

    it("numberHouse 0 vira '0' e null/undefined viram string vazia", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          {
            id: 1,
            name: "A",
            phone: "1",
            Register: { address: { numberHouse: 0 } },
          },
          {
            id: 2,
            name: "B",
            phone: "2",
            Register: { address: { numberHouse: null } },
          },
          { id: 3, name: "C", phone: "3", Register: { address: {} } },
        ],
      });

      const result = await clientsListRepository.list();

      expect(result.map((c) => c.address?.numberHouse)).toEqual(["0", "", ""]);
    });

    it("retorna lista vazia quando o payload não é array", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: null });

      expect(await clientsListRepository.list()).toEqual([]);
    });
  });

  describe("update", () => {
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

    it("faz um único PUT /register/:id com cliente e endereço", async () => {
      vi.mocked(httpClient.put).mockResolvedValue({ data: {} });

      await clientsListRepository.update(40, input);

      expect(httpClient.put).toHaveBeenCalledTimes(1);
      expect(httpClient.put).toHaveBeenCalledWith("/register/40", input);
    });

    it("propaga o erro da API", async () => {
      const error = new Error("CPF já cadastrado no sistema.");
      vi.mocked(httpClient.put).mockRejectedValueOnce(error);

      await expect(clientsListRepository.update(40, input)).rejects.toBe(error);
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
