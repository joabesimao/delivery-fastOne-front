import { describe, expect, it } from "vitest";
import { parseIntervalKm } from "./oilChangeConfig";

describe("parseIntervalKm", () => {
  it("converte string numérica positiva", () => {
    expect(parseIntervalKm("5000")).toBe(5000);
    expect(parseIntervalKm("7500.5")).toBe(7500.5);
  });

  it("retorna null para vazio, zero, negativo ou não numérico", () => {
    expect(parseIntervalKm("")).toBeNull();
    expect(parseIntervalKm("0")).toBeNull();
    expect(parseIntervalKm("-10")).toBeNull();
    expect(parseIntervalKm("abc")).toBeNull();
  });
});
