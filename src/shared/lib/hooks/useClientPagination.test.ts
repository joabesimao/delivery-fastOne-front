import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { describe, expect, it } from "vitest";
import { useClientPagination } from "./useClientPagination";

const numbers = (total: number) => Array.from({ length: total }, (_, i) => i);

const rowsEvent = (value: string) =>
  ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

const tenPerPage = { initialRowsPerPage: 10 };

describe("useClientPagination", () => {
  it("retorna a primeira página com 50 itens por padrão", () => {
    const { result } = renderHook(() => useClientPagination(numbers(120)));
    expect(result.current.pageItems).toEqual(numbers(50));
    expect(result.current.paginationProps).toMatchObject({
      count: 120,
      page: 0,
      rowsPerPage: 50,
    });
  });

  it("respeita initialRowsPerPage", () => {
    const { result } = renderHook(() =>
      useClientPagination(numbers(25), { initialRowsPerPage: 5 }),
    );
    expect(result.current.pageItems).toEqual(numbers(5));
  });

  it("navega entre páginas", () => {
    const { result } = renderHook(() =>
      useClientPagination(numbers(25), tenPerPage),
    );
    act(() => result.current.paginationProps.onPageChange(null, 2));
    expect(result.current.pageItems).toEqual([20, 21, 22, 23, 24]);
    expect(result.current.paginationProps.page).toBe(2);
  });

  it("trocar linhas por página volta para a primeira página", () => {
    const { result } = renderHook(() =>
      useClientPagination(numbers(25), tenPerPage),
    );
    act(() => result.current.paginationProps.onPageChange(null, 2));
    act(() =>
      result.current.paginationProps.onRowsPerPageChange(rowsEvent("5")),
    );
    expect(result.current.paginationProps.rowsPerPage).toBe(5);
    expect(result.current.paginationProps.page).toBe(0);
    expect(result.current.pageItems).toEqual(numbers(5));
  });

  it("volta para a primeira página quando resetKey muda", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) =>
        useClientPagination(numbers(25), { ...tenPerPage, resetKey }),
      { initialProps: { resetKey: "a" } },
    );
    act(() => result.current.paginationProps.onPageChange(null, 2));
    rerender({ resetKey: "b" });
    expect(result.current.paginationProps.page).toBe(0);
  });

  it("limita a página à última quando a lista encolhe", () => {
    const { result, rerender } = renderHook(
      ({ items }) => useClientPagination(items, tenPerPage),
      { initialProps: { items: numbers(25) } },
    );
    act(() => result.current.paginationProps.onPageChange(null, 2));
    rerender({ items: numbers(12) });
    expect(result.current.paginationProps.page).toBe(1);
    expect(result.current.pageItems).toEqual([10, 11]);
  });

  it("lista vazia fica na página 0 sem itens", () => {
    const { result } = renderHook(() => useClientPagination<number>([]));
    expect(result.current.pageItems).toEqual([]);
    expect(result.current.paginationProps.page).toBe(0);
    expect(result.current.paginationProps.count).toBe(0);
  });
});
