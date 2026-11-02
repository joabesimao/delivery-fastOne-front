import { describe, expect, it } from "vitest";
import {
  emptyNeighborhoodForm,
  toNeighborhoodFormValues,
  toNeighborhoodInput,
  validateNeighborhoodForm,
} from "./neighborhood";

describe("neighborhood", () => {
  it("emptyNeighborhoodForm começa vazio", () => {
    expect(emptyNeighborhoodForm).toEqual({ name: "", cityId: "" });
  });

  it("toNeighborhoodFormValues converte cityId para string", () => {
    expect(
      toNeighborhoodFormValues({
        id: 1,
        name: "Centro",
        cityId: 10,
        cityName: "Campinas",
      }),
    ).toEqual({ name: "Centro", cityId: "10" });
  });

  describe("validateNeighborhoodForm", () => {
    it("aceita formulário válido", () => {
      expect(validateNeighborhoodForm({ name: "Centro", cityId: "1" })).toEqual(
        {},
      );
    });

    it("exige nome (ignorando espaços) e cidade", () => {
      const errors = validateNeighborhoodForm({ name: "   ", cityId: "" });
      expect(errors.name).toBe("Informe o nome do bairro.");
      expect(errors.cityId).toBe("Selecione a cidade.");
    });
  });

  it("toNeighborhoodInput aplica trim e converte cityId", () => {
    expect(toNeighborhoodInput({ name: "  Centro ", cityId: "10" })).toEqual({
      name: "Centro",
      cityId: 10,
    });
  });
});
