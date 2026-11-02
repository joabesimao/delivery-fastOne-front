import { describe, expect, it } from "vitest";
import {
  emptyCityForm,
  toCityFormValues,
  toCityInput,
  validateCityForm,
} from "./city";

describe("city", () => {
  it("emptyCityForm começa vazio", () => {
    expect(emptyCityForm).toEqual({ name: "" });
  });

  it("toCityFormValues copia o nome", () => {
    expect(toCityFormValues({ id: 1, name: "Campinas" })).toEqual({
      name: "Campinas",
    });
  });

  it("validateCityForm exige nome não vazio", () => {
    expect(validateCityForm({ name: "Campinas" })).toEqual({});
    expect(validateCityForm({ name: "   " }).name).toBe(
      "Informe o nome da cidade.",
    );
  });

  it("toCityInput aplica trim", () => {
    expect(toCityInput({ name: "  Campinas  " })).toEqual({ name: "Campinas" });
  });
});
