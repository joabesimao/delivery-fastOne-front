import { describe, expect, it } from "vitest";
import type { Delivery } from "./delivery";
import {
  ALL,
  citiesOfDeliveries,
  countActiveDeliveries,
  deliverymenOfDeliveries,
  filterDeliveries,
  filterFinishableDeliveries,
  neighborhoodsOfDeliveries,
  type DeliveryListFilters,
} from "./deliveryFilters";

const makeDelivery = (overrides: Partial<Delivery> = {}): Delivery => ({
  id: 1,
  quantity: "1",
  amount: 10,
  createdAt: "2026-01-01T10:00:00.000Z",
  receivedAt: null,
  finishedAt: null,
  status: "actived",
  deliverymanId: null,
  deliveryman: null,
  unitStoreName: null,
  client: { name: "Maria Silva", phone: "11999999999" },
  address: {
    street: "Rua das Flores",
    numberHouse: "10",
    neighborhood: "Centro",
    city: "Recife",
    reference: "",
  },
  ...overrides,
});

const deliveryman = (id: number, name: string, lastName: string) => ({
  id,
  name,
  lastName,
  phone: "",
});

const noFilters: DeliveryListFilters = {
  search: "",
  progress: ALL,
  deliverymanId: ALL,
  city: ALL,
  neighborhood: ALL,
};

describe("filterDeliveries", () => {
  const deliveries = [
    makeDelivery({ id: 1, status: "actived" }),
    makeDelivery({ id: 2, status: "delivered" }),
    makeDelivery({ id: 3, status: "finished" }),
  ];

  it("sem filtros retorna todas", () => {
    expect(filterDeliveries(deliveries, noFilters)).toHaveLength(3);
  });

  it("progress active inclui entregues e exclui finalizadas", () => {
    const result = filterDeliveries(deliveries, {
      ...noFilters,
      progress: "active",
    });
    expect(result.map((d) => d.id)).toEqual([1, 2]);
  });

  it("progress finished retorna só finalizadas", () => {
    const result = filterDeliveries(deliveries, {
      ...noFilters,
      progress: "finished",
    });
    expect(result.map((d) => d.id)).toEqual([3]);
  });

  it("busca por nome do cliente, rua ou id, ignorando caixa e espaços", () => {
    const list = [
      makeDelivery({ id: 11, client: { name: "João", phone: "" } }),
      makeDelivery({
        id: 22,
        address: { ...makeDelivery().address, street: "Avenida Brasil" },
      }),
      makeDelivery({ id: 33 }),
    ];

    expect(
      filterDeliveries(list, { ...noFilters, search: "  JOÃO " }).map(
        (d) => d.id,
      ),
    ).toEqual([11]);
    expect(
      filterDeliveries(list, { ...noFilters, search: "brasil" }).map(
        (d) => d.id,
      ),
    ).toEqual([22]);
    expect(
      filterDeliveries(list, { ...noFilters, search: "33" }).map((d) => d.id),
    ).toEqual([33]);
  });

  it("filtra por entregador, inclusive entregas sem entregador", () => {
    const list = [
      makeDelivery({ id: 1, deliveryman: deliveryman(5, "Ana", "Souza") }),
      makeDelivery({ id: 2, deliveryman: null }),
    ];

    expect(
      filterDeliveries(list, { ...noFilters, deliverymanId: "5" }).map(
        (d) => d.id,
      ),
    ).toEqual([1]);
    expect(
      filterDeliveries(list, { ...noFilters, deliverymanId: "9" }),
    ).toEqual([]);
  });

  it("combina cidade, bairro e progresso", () => {
    const list = [
      makeDelivery({
        id: 1,
        address: {
          ...makeDelivery().address,
          city: "Olinda",
          neighborhood: "Varadouro",
        },
      }),
      makeDelivery({
        id: 2,
        status: "finished",
        address: {
          ...makeDelivery().address,
          city: "Olinda",
          neighborhood: "Varadouro",
        },
      }),
      makeDelivery({
        id: 3,
        address: {
          ...makeDelivery().address,
          city: "Recife",
          neighborhood: "Varadouro",
        },
      }),
    ];

    const result = filterDeliveries(list, {
      ...noFilters,
      city: "Olinda",
      neighborhood: "Varadouro",
      progress: "active",
    });

    expect(result.map((d) => d.id)).toEqual([1]);
  });
});

describe("filterFinishableDeliveries", () => {
  const list = [
    makeDelivery({
      id: 1,
      status: "actived",
      deliveryman: deliveryman(1, "Carlos", "Lima"),
    }),
    makeDelivery({
      id: 2,
      status: "delivered",
      client: { name: "Pedro", phone: "" },
      address: {
        ...makeDelivery().address,
        city: "Olinda",
        neighborhood: "Carmo",
      },
    }),
  ];

  it("filtra por status", () => {
    const result = filterFinishableDeliveries(list, {
      search: "",
      status: "delivered",
      deliverymanId: ALL,
    });
    expect(result.map((d) => d.id)).toEqual([2]);
  });

  it("busca por nome do entregador, cidade e bairro", () => {
    const base = { status: ALL, deliverymanId: ALL } as const;
    const ids = (search: string) =>
      filterFinishableDeliveries(list, { ...base, search }).map((d) => d.id);

    expect(ids("lima")).toEqual([1]);
    expect(ids("olinda")).toEqual([2]);
    expect(ids("carmo")).toEqual([2]);
    expect(ids("pedro")).toEqual([2]);
  });

  it("combina status e entregador", () => {
    const result = filterFinishableDeliveries(list, {
      search: "",
      status: "actived",
      deliverymanId: "1",
    });
    expect(result.map((d) => d.id)).toEqual([1]);

    expect(
      filterFinishableDeliveries(list, {
        search: "",
        status: "delivered",
        deliverymanId: "1",
      }),
    ).toEqual([]);
  });
});

describe("countActiveDeliveries", () => {
  it("conta tudo que não está finalizado", () => {
    expect(
      countActiveDeliveries([
        makeDelivery({ status: "actived" }),
        makeDelivery({ status: "delivered" }),
        makeDelivery({ status: "finished" }),
      ]),
    ).toBe(2);
    expect(countActiveDeliveries([])).toBe(0);
  });
});

describe("deliverymenOfDeliveries", () => {
  it("deduplica por id e ordena pelo nome", () => {
    const result = deliverymenOfDeliveries([
      makeDelivery({ deliveryman: deliveryman(2, "Zeca", "Alves") }),
      makeDelivery({ deliveryman: deliveryman(1, "Bia", "Costa") }),
      makeDelivery({ deliveryman: deliveryman(2, "Zeca", "Alves") }),
      makeDelivery({ deliveryman: null }),
    ]);

    expect(result).toEqual([
      { id: 1, name: "Bia Costa" },
      { id: 2, name: "Zeca Alves" },
    ]);
  });
});

describe("citiesOfDeliveries e neighborhoodsOfDeliveries", () => {
  const withAddress = (city: string, neighborhood: string) =>
    makeDelivery({
      address: { ...makeDelivery().address, city, neighborhood },
    });

  const list = [
    withAddress("Recife", "Boa Viagem"),
    withAddress("Olinda", "Carmo"),
    withAddress("Recife", "Boa Viagem"),
    withAddress("Recife", "Antares"),
    withAddress("", ""),
  ];

  it("cidades únicas, sem vazios e ordenadas", () => {
    expect(citiesOfDeliveries(list)).toEqual(["Olinda", "Recife"]);
  });

  it("bairros restritos à cidade ou todos quando ALL", () => {
    expect(neighborhoodsOfDeliveries(list, "Recife")).toEqual([
      "Antares",
      "Boa Viagem",
    ]);
    expect(neighborhoodsOfDeliveries(list, ALL)).toEqual([
      "Antares",
      "Boa Viagem",
      "Carmo",
    ]);
  });
});
