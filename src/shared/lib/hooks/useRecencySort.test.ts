import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRecencySort } from "./useRecencySort";

const items = [{ id: 2 }, { id: 7 }, { id: 4 }];

describe("useRecencySort", () => {
  it("começa pelos mais recentes", () => {
    const { result } = renderHook(() => useRecencySort(items));
    expect(result.current.sortOrder).toBe("recent");
    expect(result.current.sorted.map((i) => i.id)).toEqual([7, 4, 2]);
  });

  it("troca para os mais antigos", () => {
    const { result } = renderHook(() => useRecencySort(items));
    act(() => result.current.setSortOrder("oldest"));
    expect(result.current.sorted.map((i) => i.id)).toEqual([2, 4, 7]);
  });

  it("reordena quando a lista muda", () => {
    const { result, rerender } = renderHook(
      ({ list }) => useRecencySort(list),
      { initialProps: { list: items } },
    );
    rerender({ list: [...items, { id: 9 }] });
    expect(result.current.sorted.map((i) => i.id)).toEqual([9, 7, 4, 2]);
  });
});
