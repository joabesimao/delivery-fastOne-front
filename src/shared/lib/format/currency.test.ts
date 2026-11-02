import { describe, expect, it } from "vitest";
import { formatCurrency } from "./currency";

const nbsp = String.fromCharCode(160);

describe("formatCurrency", () => {
  it("formata número em reais", () => {
    expect(formatCurrency(1234.5)).toBe(`R$${nbsp}1.234,50`);
  });

  it("aceita string numérica", () => {
    expect(formatCurrency("10")).toBe(`R$${nbsp}10,00`);
  });

  it("formata zero e valores negativos", () => {
    expect(formatCurrency(0)).toBe(`R$${nbsp}0,00`);
    expect(formatCurrency(-5)).toBe(`-R$${nbsp}5,00`);
  });
});
