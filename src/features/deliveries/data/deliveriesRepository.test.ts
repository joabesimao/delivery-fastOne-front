import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { deliveriesRepository } from "./deliveriesRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("deliveriesRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("list", () => {
    it("busca /orderDelivery e mapeia o DTO completo", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          {
            id: 5,
            quantity: 3,
            amount: "45.50",
            data: "2026-01-01T10:00:00.000Z",
            receivedAt: "2026-01-01T11:00:00.000Z",
            finishedAt: "2026-01-01T12:00:00.000Z",
            status: "finished",
            deliverymanId: 9,
            unitStore: { name: "Loja 1" },
            deliveryman: {
              id: 9,
              name: "Ana",
              lastName: "Souza",
              phone: "8199",
            },
            Register: {
              client: { name: "Maria", phone: "81988887777" },
              address: {
                street: "Rua A",
                numberHouse: 12,
                neighborhood: "Centro",
                city: "Recife",
                reference: "Perto da praça",
              },
            },
          },
        ],
      });

      const result = await deliveriesRepository.list();

      expect(httpClient.get).toHaveBeenCalledWith("/orderDelivery");
      expect(result).toEqual([
        {
          id: 5,
          quantity: "3",
          amount: 45.5,
          createdAt: "2026-01-01T10:00:00.000Z",
          receivedAt: "2026-01-01T11:00:00.000Z",
          finishedAt: "2026-01-01T12:00:00.000Z",
          status: "finished",
          deliverymanId: 9,
          deliveryman: { id: 9, name: "Ana", lastName: "Souza", phone: "8199" },
          unitStoreName: "Loja 1",
          client: { name: "Maria", phone: "81988887777" },
          address: {
            street: "Rua A",
            numberHouse: "12",
            neighborhood: "Centro",
            city: "Recife",
            reference: "Perto da praça",
          },
        },
      ]);
    });

    it("aplica defaults quando campos opcionais e Register estão ausentes", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          {
            id: 1,
            quantity: "1",
            amount: 10,
            data: "2026-01-01T10:00:00.000Z",
            status: "actived",
            Register: null,
          },
        ],
      });

      const [delivery] = await deliveriesRepository.list();

      expect(delivery).toMatchObject({
        receivedAt: null,
        finishedAt: null,
        deliverymanId: null,
        deliveryman: null,
        unitStoreName: null,
        client: { name: "", phone: "" },
        address: {
          street: "",
          numberHouse: "",
          neighborhood: "",
          city: "",
          reference: "",
        },
      });
    });

    it("normaliza nulos dentro de deliveryman, cliente e endereço", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [
          {
            id: 1,
            quantity: "1",
            amount: 10,
            data: "d",
            status: "delivered",
            deliveryman: { id: 2, name: "B", lastName: "C", phone: null },
            Register: {
              client: { name: "M", phone: null },
              address: { neighborhood: null, reference: null },
            },
          },
        ],
      });

      const [delivery] = await deliveriesRepository.list();

      expect(delivery.deliveryman?.phone).toBe("");
      expect(delivery.client.phone).toBe("");
      expect(delivery.address.neighborhood).toBe("");
      expect(delivery.address.reference).toBe("");
    });

    it("retorna lista vazia quando o payload não é array", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: null });

      expect(await deliveriesRepository.list()).toEqual([]);
    });
  });

  describe("create", () => {
    const input = { registerId: 1, quantity: "2", amount: 20 };

    it("envia POST /orderDelivery e retorna o id numérico", async () => {
      vi.mocked(httpClient.post).mockResolvedValue({ data: { id: 77 } });

      const result = await deliveriesRepository.create(input);

      expect(httpClient.post).toHaveBeenCalledWith("/orderDelivery", input);
      expect(result).toEqual({ id: 77 });
    });

    it("retorna id null quando a resposta não traz id numérico", async () => {
      vi.mocked(httpClient.post).mockResolvedValue({ data: { id: "77" } });
      expect(await deliveriesRepository.create(input)).toEqual({ id: null });

      vi.mocked(httpClient.post).mockResolvedValue({ data: undefined });
      expect(await deliveriesRepository.create(input)).toEqual({ id: null });
    });

    it("propaga erros do HTTP", async () => {
      vi.mocked(httpClient.post).mockRejectedValue(new Error("falhou"));

      await expect(deliveriesRepository.create(input)).rejects.toThrow(
        "falhou",
      );
    });
  });

  describe("finish", () => {
    it("envia PUT /orderDelivery/:id com o payload", async () => {
      vi.mocked(httpClient.put).mockResolvedValue({ data: {} });
      const input = {
        quantity: "2",
        amount: 20,
        deliverymanId: 3,
        status: "finished" as const,
      };

      await deliveriesRepository.finish(8, input);

      expect(httpClient.put).toHaveBeenCalledWith("/orderDelivery/8", input);
    });
  });

  describe("ranking", () => {
    const query = {
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      status: "all" as const,
      pageSize: 10,
      page: 2,
    };

    it("envia a query como params e mapeia a página", async () => {
      const items = [
        { deliverymanId: 1, deliverymanName: "Ana", totalDeliveries: 4 },
      ];
      vi.mocked(httpClient.get).mockResolvedValue({
        data: {
          items,
          page: "2",
          totalItems: "21",
          totalPages: "3",
          totalDeliveries: "55",
        },
      });

      const result = await deliveriesRepository.ranking(query);

      expect(httpClient.get).toHaveBeenCalledWith(
        "/orderDelivery/ranking/deliveryman",
        { params: query },
      );
      expect(result).toEqual({
        items,
        page: 2,
        totalItems: 21,
        totalPages: 3,
        totalDeliveries: 55,
      });
    });

    it("usa defaults quando a resposta é vazia", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: {} });

      expect(await deliveriesRepository.ranking(query)).toEqual({
        items: [],
        page: 2,
        totalItems: 0,
        totalPages: 1,
        totalDeliveries: 0,
      });
    });

    it("tolera data nulo", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: null });

      const result = await deliveriesRepository.ranking(query);

      expect(result.items).toEqual([]);
      expect(result.page).toBe(2);
    });
  });
});
