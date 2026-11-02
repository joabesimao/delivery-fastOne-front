import { afterEach, describe, expect, it, vi } from "vitest";
import {
  computeTotalValue,
  emptyFuelRefillForm,
  fuelConsumption,
  toFuelRefillFormValues,
  toFuelRefillInput,
  validateFuelRefillForm,
  type FuelRefill,
  type FuelRefillFormValues,
} from "./fuelRefill";

const refill = (overrides: Partial<FuelRefill> = {}): FuelRefill => ({
  id: 1,
  vehicleId: 2,
  deliverymanId: 3,
  km: 12500,
  previousKm: 12000,
  kmDriven: 500,
  liters: 40,
  pricePerLiter: 5.5,
  totalValue: 220,
  refillDate: "2025-03-10T00:00:00.000Z",
  vehicle: null,
  deliveryman: null,
  ...overrides,
});

const form = (
  overrides: Partial<FuelRefillFormValues> = {},
): FuelRefillFormValues => ({
  vehicleId: "2",
  deliverymanId: "3",
  km: "12500",
  liters: "40",
  pricePerLiter: "5.5",
  totalValue: "220",
  refillDate: "2025-03-10",
  ...overrides,
});

describe("computeTotalValue", () => {
  it("multiplica litros por preço com duas casas", () => {
    expect(computeTotalValue("40", "5.5")).toBe("220.00");
    expect(computeTotalValue("30", "5.333")).toBe("159.99");
  });

  it("retorna vazio quando falta algum valor", () => {
    expect(computeTotalValue("", "5")).toBe("");
    expect(computeTotalValue("10", "")).toBe("");
  });

  it("retorna vazio para valores zero, negativos ou não numéricos", () => {
    expect(computeTotalValue("0", "5")).toBe("");
    expect(computeTotalValue("-1", "5")).toBe("");
    expect(computeTotalValue("abc", "5")).toBe("");
  });
});

describe("fuelConsumption", () => {
  it("calcula km/l com duas casas", () => {
    expect(fuelConsumption(refill({ kmDriven: 500, liters: 40 }))).toBe(
      "12.50 km/l",
    );
  });

  it("retorna traço quando kmDriven é null", () => {
    expect(fuelConsumption(refill({ kmDriven: null }))).toBe("—");
  });

  it("retorna traço quando litros é zero, evitando divisão por zero", () => {
    expect(fuelConsumption(refill({ liters: 0 }))).toBe("—");
  });

  it("aceita kmDriven zero", () => {
    expect(fuelConsumption(refill({ kmDriven: 0 }))).toBe("0.00 km/l");
  });
});

describe("emptyFuelRefillForm", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("começa vazio com a data de hoje", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-15T12:00:00.000Z"));

    expect(emptyFuelRefillForm()).toEqual({
      vehicleId: "",
      deliverymanId: "",
      km: "",
      liters: "",
      pricePerLiter: "",
      totalValue: "",
      refillDate: "2025-03-15",
    });
  });
});

describe("toFuelRefillFormValues", () => {
  it("converte números em strings e ISO em data simples", () => {
    expect(toFuelRefillFormValues(refill())).toEqual(form());
  });

  it("usa string vazia quando pricePerLiter é null", () => {
    expect(
      toFuelRefillFormValues(refill({ pricePerLiter: null })).pricePerLiter,
    ).toBe("");
  });
});

describe("validateFuelRefillForm", () => {
  it("aceita formulário válido", () => {
    expect(validateFuelRefillForm(form())).toEqual({});
  });

  it("exige todos os campos quando vazio", () => {
    expect(
      validateFuelRefillForm(
        form({
          vehicleId: "",
          deliverymanId: "",
          km: "",
          liters: "",
          pricePerLiter: "",
          totalValue: "",
          refillDate: "",
        }),
      ),
    ).toEqual({
      vehicleId: "Selecione o veículo.",
      deliverymanId: "Selecione o entregador.",
      km: "Informe o km do abastecimento.",
      liters: "Informe os litros abastecidos.",
      pricePerLiter: "Informe o preço do litro.",
      totalValue: "Informe o valor pago.",
      refillDate: "Informe a data do abastecimento.",
    });
  });

  it("rejeita valores numéricos zero ou negativos", () => {
    const errors = validateFuelRefillForm(
      form({ km: "0", liters: "-1", pricePerLiter: "0", totalValue: "-5" }),
    );

    expect(Object.keys(errors).sort()).toEqual([
      "km",
      "liters",
      "pricePerLiter",
      "totalValue",
    ]);
  });
});

describe("toFuelRefillInput", () => {
  it("converte strings em números e data simples em ISO UTC", () => {
    expect(toFuelRefillInput(form())).toEqual({
      vehicleId: 2,
      deliverymanId: 3,
      km: 12500,
      liters: 40,
      pricePerLiter: 5.5,
      totalValue: 220,
      refillDate: "2025-03-10T00:00:00.000Z",
    });
  });
});
