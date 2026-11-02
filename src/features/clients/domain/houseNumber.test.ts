import { describe, expect, it } from "vitest";
import { isValidHouseNumber } from "./houseNumber";

describe("isValidHouseNumber", () => {
  it("aceita números inteiros não negativos, ignorando espaços nas pontas", () => {
    expect(isValidHouseNumber("0")).toBe(true);
    expect(isValidHouseNumber("120")).toBe(true);
    expect(isValidHouseNumber(" 12 ")).toBe(true);
  });

  it("rejeita texto, letras misturadas, decimais, vazio e negativos", () => {
    expect(isValidHouseNumber("abc")).toBe(false);
    expect(isValidHouseNumber("S/N")).toBe(false);
    expect(isValidHouseNumber("12a")).toBe(false);
    expect(isValidHouseNumber("1.5")).toBe(false);
    expect(isValidHouseNumber("")).toBe(false);
    expect(isValidHouseNumber("-1")).toBe(false);
  });

  it("rejeita valores acima do limite de inteiro de 32 bits", () => {
    expect(isValidHouseNumber("2147483647")).toBe(true);
    expect(isValidHouseNumber("2147483648")).toBe(false);
    expect(isValidHouseNumber("99999999999")).toBe(false);
  });
});
