import { describe, expect, it } from "vitest";
import {
  emptyVehicleForm,
  toVehicleFormValues,
  toVehicleInput,
  validateVehicleForm,
  vehicleLabel,
  type VehicleFormValues,
} from "./vehicle";

const form = (
  overrides: Partial<VehicleFormValues> = {},
): VehicleFormValues => ({
  plate: "abc1d23",
  model: "CG 160",
  brand: "Honda",
  deliverymanId: "5",
  ...overrides,
});

describe("vehicle", () => {
  it("vehicleLabel junta placa e modelo", () => {
    expect(vehicleLabel({ plate: "ABC1D23", model: "CG 160" })).toBe(
      "ABC1D23 — CG 160",
    );
  });

  it("emptyVehicleForm começa vazio", () => {
    expect(emptyVehicleForm).toEqual({
      plate: "",
      model: "",
      brand: "",
      deliverymanId: "",
    });
  });

  describe("toVehicleFormValues", () => {
    it("converte campos preenchidos", () => {
      expect(
        toVehicleFormValues({
          id: 1,
          plate: "ABC1D23",
          model: "CG 160",
          brand: "Honda",
          deliverymanId: 5,
        }),
      ).toEqual({
        plate: "ABC1D23",
        model: "CG 160",
        brand: "Honda",
        deliverymanId: "5",
      });
    });

    it("usa string vazia para brand e entregador nulos", () => {
      expect(
        toVehicleFormValues({
          id: 1,
          plate: "A",
          model: "B",
          brand: null,
          deliverymanId: null,
        }),
      ).toMatchObject({ brand: "", deliverymanId: "" });
    });
  });

  describe("validateVehicleForm", () => {
    it("aceita formulário válido", () => {
      expect(validateVehicleForm(form())).toEqual({});
    });

    it("exige placa e modelo não vazios", () => {
      const errors = validateVehicleForm(form({ plate: " ", model: "" }));
      expect(errors.plate).toBe("Informe a placa do veículo.");
      expect(errors.model).toBe("Informe o modelo do veículo.");
    });
  });

  describe("toVehicleInput", () => {
    it("normaliza placa em maiúsculas e aplica trim", () => {
      expect(
        toVehicleInput(form({ plate: "  abc1d23 ", model: " CG " })),
      ).toEqual({
        plate: "ABC1D23",
        model: "CG",
        brand: "Honda",
        deliverymanId: 5,
      });
    });

    it("omite brand e deliverymanId vazios", () => {
      const input = toVehicleInput(form({ brand: "  ", deliverymanId: "" }));
      expect(input.brand).toBeUndefined();
      expect(input.deliverymanId).toBeUndefined();
    });
  });
});
