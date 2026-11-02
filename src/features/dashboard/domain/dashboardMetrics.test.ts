import { describe, expect, it } from "vitest";
import type { Delivery } from "@/features/deliveries";
import {
  filterByStatus,
  greetingName,
  initialsOf,
  maxDailyVolume,
  revenueDelta,
  type DashboardMetrics,
  type DashboardPerformance,
} from "./dashboardMetrics";

const metrics = (
  current: number,
  previous: number | null,
): DashboardMetrics => ({
  clients: 0,
  deliverymen: 0,
  activeDeliveries: 0,
  deliveredRevenue: current,
  deliveredRevenuePreviousPeriod: previous,
  cities: 0,
  neighborhoods: 0,
});

const performance = (totals: number[]): DashboardPerformance => ({
  days: totals.map((total, i) => ({
    date: `2025-03-0${i + 1}`,
    label: `0${i + 1}`,
    total,
  })),
  totalOrders: totals.reduce((a, b) => a + b, 0),
  avgDeliveryMinutes: null,
  peakDay: null,
});

describe("revenueDelta", () => {
  it("formata aumento com sinal de +", () => {
    expect(revenueDelta(metrics(150, 100))).toBe("+50.0%");
  });

  it("formata queda com sinal de -", () => {
    expect(revenueDelta(metrics(75, 100))).toBe("-25.0%");
  });

  it("retorna +0.0% quando não há variação", () => {
    expect(revenueDelta(metrics(100, 100))).toBe("+0.0%");
  });

  it("retorna null quando a base é zero", () => {
    expect(revenueDelta(metrics(100, 0))).toBeNull();
  });

  it("retorna null sem período anterior ou sem métricas", () => {
    expect(revenueDelta(metrics(100, null))).toBeNull();
    expect(revenueDelta(undefined)).toBeNull();
  });
});

describe("maxDailyVolume", () => {
  it("retorna o maior total diário", () => {
    expect(maxDailyVolume(performance([3, 9, 5]))).toBe(9);
  });

  it("retorna 1 quando todos os dias são zero", () => {
    expect(maxDailyVolume(performance([0, 0]))).toBe(1);
  });

  it("retorna 1 sem dias ou sem dados", () => {
    expect(maxDailyVolume(performance([]))).toBe(1);
    expect(maxDailyVolume(undefined)).toBe(1);
  });
});

describe("filterByStatus", () => {
  const deliveries = [
    { id: 1, status: "actived" },
    { id: 2, status: "finished" },
    { id: 3, status: "finished" },
  ] as Delivery[];

  it("all devolve todas as entregas", () => {
    expect(filterByStatus(deliveries, "all")).toHaveLength(3);
  });

  it("filtra pelo status informado", () => {
    expect(filterByStatus(deliveries, "finished").map((d) => d.id)).toEqual([
      2, 3,
    ]);
  });

  it("retorna vazio quando nenhuma entrega tem o status", () => {
    expect(filterByStatus(deliveries, "delivered")).toEqual([]);
  });
});

describe("initialsOf", () => {
  it("usa as iniciais das duas primeiras palavras", () => {
    expect(initialsOf("Maria da Silva")).toBe("Md");
  });

  it("funciona com um único nome", () => {
    expect(initialsOf("Ana")).toBe("A");
  });
});

describe("greetingName", () => {
  it("prioriza o nome", () => {
    expect(greetingName({ name: "Joabe", email: "a@b.com" })).toBe("Joabe");
  });

  it("usa Operador quando não há nome nem e-mail", () => {
    expect(greetingName({ name: "", email: "" })).toBe("Operador");
  });

  it("reconhece o admin padrão sem diferenciar maiúsculas", () => {
    expect(greetingName({ name: "", email: "Admin@FastOne.local" })).toBe(
      "Operador Admin",
    );
  });

  it("usa o e-mail como fallback", () => {
    expect(greetingName({ name: "", email: "x@y.com" })).toBe("x@y.com");
  });
});
