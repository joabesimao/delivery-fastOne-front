import { describe, expect, it } from "vitest";
import {
  MIN_SEARCH_LENGTH,
  hasAnyResult,
  isSearchable,
  type SearchResults,
} from "./searchResults";

const empty: SearchResults = { orders: [], clients: [], deliverymen: [] };

describe("isSearchable", () => {
  it("exige o mínimo de caracteres ignorando espaços", () => {
    expect(isSearchable("a")).toBe(false);
    expect(isSearchable(" a ")).toBe(false);
    expect(isSearchable("a".repeat(MIN_SEARCH_LENGTH))).toBe(true);
    expect(isSearchable("")).toBe(false);
  });
});

describe("hasAnyResult", () => {
  it("é falso para nulo, indefinido e listas vazias", () => {
    expect(hasAnyResult(null)).toBe(false);
    expect(hasAnyResult(undefined)).toBe(false);
    expect(hasAnyResult(empty)).toBe(false);
  });

  it.each([
    ["orders", { orders: [{ id: 1 }] }],
    ["clients", { clients: [{ id: 1 }] }],
    ["deliverymen", { deliverymen: [{ id: 1 }] }],
  ])("é verdadeiro quando só %s tem itens", (_, partial) => {
    expect(hasAnyResult({ ...empty, ...partial } as SearchResults)).toBe(true);
  });
});
