import { describe, expect, it } from "vitest";
import type { Delivery } from "./delivery";
import {
  countByNeighborhood,
  countByStatus,
  initialsOf,
  summarizeDeliveries,
  topDeliverymenPerformance,
} from "./deliveryReport";

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
  client: { name: "Maria", phone: "" },
  address: {
    street: "Rua A",
    numberHouse: "1",
    neighborhood: "Centro",
    city: "Recife",
    reference: "",
  },
  ...overrides,
});

const withDeliveryman = (
  id: number,
  name: string,
  overrides: Partial<Delivery> = {},
) =>
  makeDelivery({
    deliverymanId: id,
    deliveryman: { id, name, lastName: "X", phone: "8199" },
    ...overrides,
  });

describe("summarizeDeliveries", () => {
  it("só entregas finalizadas contam receita e ticket médio", () => {
    const result = summarizeDeliveries([
      makeDelivery({ id: 1, status: "finished", amount: 30 }),
      makeDelivery({ id: 2, status: "finished", amount: 20 }),
      makeDelivery({ id: 3, status: "delivered", amount: 100 }),
      makeDelivery({ id: 4, status: "actived", amount: 100 }),
    ]);

    expect(result).toEqual({
      totalOrders: 4,
      finishedCount: 2,
      totalRevenue: 50,
      averageTicket: 25,
    });
  });

  it("ticket médio é 0 sem entregas finalizadas", () => {
    expect(summarizeDeliveries([makeDelivery({ status: "actived" })])).toEqual({
      totalOrders: 1,
      finishedCount: 0,
      totalRevenue: 0,
      averageTicket: 0,
    });
    expect(summarizeDeliveries([]).averageTicket).toBe(0);
  });
});

describe("topDeliverymenPerformance", () => {
  it("agrega por entregador com taxa de conclusão e receita", () => {
    const result = topDeliverymenPerformance([
      withDeliveryman(1, "Ana", { id: 1, status: "finished", amount: 40 }),
      withDeliveryman(1, "Ana", { id: 2, status: "delivered", amount: 10 }),
      withDeliveryman(1, "Ana", { id: 3, status: "finished", amount: 20 }),
    ]);

    expect(result).toEqual([
      {
        key: "dm-1",
        name: "Ana X",
        phone: "8199",
        total: 3,
        finished: 2,
        active: 1,
        revenue: 60,
        completionRate: 67,
      },
    ]);
  });

  it("entregas sem entregador viram itens separados 'Sem entregador'", () => {
    const result = topDeliverymenPerformance([
      makeDelivery({ id: 1 }),
      makeDelivery({ id: 2 }),
    ]);

    expect(result.map((r) => r.key).sort()).toEqual(["order-1", "order-2"]);
    expect(result.every((r) => r.name === "Sem entregador")).toBe(true);
    expect(result.every((r) => r.phone === "-")).toBe(true);
  });

  it("ordena por total, depois receita, depois nome, e limita a 3", () => {
    const result = topDeliverymenPerformance([
      withDeliveryman(1, "Bruno", { id: 1, status: "finished", amount: 10 }),
      withDeliveryman(2, "Alice", { id: 2, status: "finished", amount: 10 }),
      withDeliveryman(3, "Carla", { id: 3, status: "finished", amount: 50 }),
      withDeliveryman(4, "Zeca", { id: 4, status: "finished", amount: 1 }),
      withDeliveryman(4, "Zeca", { id: 5, status: "finished", amount: 1 }),
    ]);

    expect(result.map((r) => r.key)).toEqual(["dm-4", "dm-3", "dm-2"]);
  });
});

describe("countByNeighborhood", () => {
  const at = (neighborhood: string) =>
    makeDelivery({ address: { ...makeDelivery().address, neighborhood } });

  it("agrupa vazios como 'Sem bairro' e ordena por contagem e nome", () => {
    const result = countByNeighborhood([
      at("Centro"),
      at("Boa Viagem"),
      at("Centro"),
      at("   "),
      at(""),
    ]);

    expect(result).toEqual([
      { name: "Centro", value: 2 },
      { name: "Sem bairro", value: 2 },
      { name: "Boa Viagem", value: 1 },
    ]);
  });

  it("limita a 7 bairros", () => {
    const names = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    expect(countByNeighborhood(names.map(at))).toHaveLength(7);
  });
});

describe("countByStatus", () => {
  it("retorna os três status em ordem fixa, inclusive zerados", () => {
    expect(
      countByStatus([
        makeDelivery({ status: "finished" }),
        makeDelivery({ status: "finished" }),
        makeDelivery({ status: "actived" }),
      ]),
    ).toEqual([
      { status: "actived", value: 1 },
      { status: "delivered", value: 0 },
      { status: "finished", value: 2 },
    ]);
  });
});

describe("initialsOf", () => {
  it("usa as iniciais das duas primeiras palavras em maiúsculas", () => {
    expect(initialsOf("joão da silva")).toBe("JD");
    expect(initialsOf("ana")).toBe("A");
    expect(initialsOf("")).toBe("");
  });
});
