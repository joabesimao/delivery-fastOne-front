import { afterEach, describe, expect, it, vi } from "vitest";
import {
  emptyOilChangeForm,
  oilChangeInterval,
  previewNextChangeKm,
  toOilChangeFormValues,
  toOilChangeInput,
  validateOilChangeForm,
  type OilChange,
  type OilChangeFormValues,
} from "./oilChange";

const form = (
  overrides: Partial<OilChangeFormValues> = {},
): OilChangeFormValues => ({
  vehicleId: "2",
  deliverymanId: "3",
  km: "10000",
  changeDate: "2025-03-10",
  ...overrides,
});

const oilChange = (overrides: Partial<OilChange> = {}): OilChange => ({
  id: 1,
  vehicleId: 2,
  deliverymanId: 3,
  km: 10000,
  nextChangeKm: 15000,
  changeDate: "2025-03-10T00:00:00.000Z",
  vehicle: null,
  deliveryman: null,
  ...overrides,
});

describe("oilChange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("emptyOilChangeForm", () => {
    it("usa a data de hoje e campos vazios", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));

      expect(emptyOilChangeForm()).toEqual({
        vehicleId: "",
        deliverymanId: "",
        km: "",
        changeDate: "2025-06-15",
      });
    });
  });

  describe("toOilChangeFormValues", () => {
    it("converte ids e km para string e corta a data", () => {
      expect(toOilChangeFormValues(oilChange())).toEqual(form());
    });
  });

  describe("validateOilChangeForm", () => {
    it("não retorna erros para formulário válido", () => {
      expect(validateOilChangeForm(form())).toEqual({});
    });

    it("exige todos os campos", () => {
      const errors = validateOilChangeForm({
        vehicleId: "",
        deliverymanId: "",
        km: "",
        changeDate: "",
      });
      expect(Object.keys(errors).sort()).toEqual([
        "changeDate",
        "deliverymanId",
        "km",
        "vehicleId",
      ]);
    });

    it("rejeita km zero ou negativo", () => {
      expect(validateOilChangeForm(form({ km: "0" })).km).toBe(
        "Informe o km lançado.",
      );
      expect(validateOilChangeForm(form({ km: "-5" })).km).toBe(
        "Informe o km lançado.",
      );
    });
  });

  describe("toOilChangeInput", () => {
    it("converte para números e data ISO", () => {
      expect(toOilChangeInput(form())).toEqual({
        vehicleId: 2,
        deliverymanId: 3,
        km: 10000,
        changeDate: "2025-03-10T00:00:00.000Z",
      });
    });
  });

  describe("oilChangeInterval", () => {
    it("retorna a diferença entre próxima troca e km atual", () => {
      expect(oilChangeInterval(oilChange())).toBe(5000);
    });
  });

  describe("previewNextChangeKm", () => {
    it("soma o intervalo ao km informado", () => {
      expect(previewNextChangeKm("10000", 5000)).toBe(15000);
    });

    it("retorna null para km vazio, zero, negativo ou inválido", () => {
      expect(previewNextChangeKm("", 5000)).toBeNull();
      expect(previewNextChangeKm("0", 5000)).toBeNull();
      expect(previewNextChangeKm("-1", 5000)).toBeNull();
      expect(previewNextChangeKm("abc", 5000)).toBeNull();
    });
  });
});
