import { describe, expect, it } from "vitest";
import type { Delivery } from "@/features/deliveries";
import { sumValues, summarizeDistribution } from "./deliveryDistribution";

const delivery = (
  status: Delivery["status"],
  neighborhood: string | undefined,
  city: string | undefined,
) =>
  ({
    status,
    address: { neighborhood, city },
  }) as Delivery;

describe("sumValues", () => {
  it("soma os valores", () => {
    expect(
      sumValues([
        { name: "a", value: 2 },
        { name: "b", value: 3 },
      ]),
    ).toBe(5);
  });

  it("retorna 0 para lista vazia", () => {
    expect(sumValues([])).toBe(0);
  });
});

describe("summarizeDistribution", () => {
  it("agrupa por bairro e cidade ordenando por quantidade e depois por nome", () => {
    const result = summarizeDistribution([
      delivery("finished", "Centro", "SP"),
      delivery("actived", "Centro", "SP"),
      delivery("actived", "Bela Vista", "RJ"),
      delivery("actived", "Alvorada", "RJ"),
    ]);

    expect(result.neighborhoods).toEqual([
      { name: "Centro", value: 2 },
      { name: "Alvorada", value: 1 },
      { name: "Bela Vista", value: 1 },
    ]);
    expect(result.cities).toEqual([
      { name: "RJ", value: 2 },
      { name: "SP", value: 2 },
    ]);
  });

  it("ignora rótulos vazios, em branco ou ausentes e aplica trim", () => {
    const result = summarizeDistribution([
      delivery("actived", "  Centro ", "SP"),
      delivery("actived", "Centro", "SP"),
      delivery("actived", "   ", ""),
      delivery("actived", undefined, undefined),
    ]);

    expect(result.neighborhoods).toEqual([{ name: "Centro", value: 2 }]);
    expect(result.cities).toEqual([{ name: "SP", value: 2 }]);
  });

  it("calcula totais e distribuição geral entre finalizadas e pendentes", () => {
    const result = summarizeDistribution([
      delivery("finished", "A", "X"),
      delivery("finished", "A", "X"),
      delivery("delivered", "A", "X"),
      delivery("actived", "A", "X"),
    ]);

    expect(result.total).toBe(4);
    expect(result.finished).toBe(2);
    expect(result.overall).toEqual([
      { name: "Finalizadas", value: 2 },
      { name: "Pendentes", value: 2 },
    ]);
  });

  it("lida com lista vazia", () => {
    expect(summarizeDistribution([])).toEqual({
      neighborhoods: [],
      cities: [],
      total: 0,
      finished: 0,
      overall: [
        { name: "Finalizadas", value: 0 },
        { name: "Pendentes", value: 0 },
      ],
    });
  });
});
