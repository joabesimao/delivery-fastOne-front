import { describe, expect, it } from "vitest";
import { DEFAULT_SORT_ORDER, sortByRecency } from "./sortOrder";

const items = [{ id: 3 }, { id: 10 }, { id: 1 }];

describe("sortByRecency", () => {
  it("recent ordena do id mais alto para o mais baixo", () => {
    expect(sortByRecency(items, "recent").map((i) => i.id)).toEqual([10, 3, 1]);
  });

  it("oldest ordena do id mais baixo para o mais alto", () => {
    expect(sortByRecency(items, "oldest").map((i) => i.id)).toEqual([1, 3, 10]);
  });

  it("não altera a lista original", () => {
    sortByRecency(items, "oldest");
    expect(items.map((i) => i.id)).toEqual([3, 10, 1]);
  });

  it("usa mais recentes como padrão", () => {
    expect(DEFAULT_SORT_ORDER).toBe("recent");
  });
});
