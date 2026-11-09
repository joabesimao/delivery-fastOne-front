import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useFiltersFromNavigation } from "./useFiltersFromNavigation";

interface Filters {
  search: string;
  status: string;
}

const toFilters = (search: string): Filters => ({ search, status: "all" });

const renderFilters = (initialState?: unknown) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter
      initialEntries={[{ pathname: "/lista", state: initialState }]}
    >
      {children}
    </MemoryRouter>
  );
  return renderHook(
    () => ({
      filters: useFiltersFromNavigation(toFilters),
      navigate: useNavigate(),
    }),
    { wrapper },
  );
};

describe("useFiltersFromNavigation", () => {
  it("começa com a busca vinda da navegação", () => {
    const { result } = renderFilters({ search: "maria" });
    expect(result.current.filters[0]).toEqual({
      search: "maria",
      status: "all",
    });
  });

  it("começa com busca vazia sem estado de navegação", () => {
    const { result } = renderFilters();
    expect(result.current.filters[0].search).toBe("");
  });

  it("aplica uma nova busca recebida estando na mesma tela e reinicia os filtros", () => {
    const { result } = renderFilters();
    act(() =>
      result.current.filters[1]({ search: "antigo", status: "finished" }),
    );

    act(() => result.current.navigate("/lista", { state: { search: "joão" } }));

    expect(result.current.filters[0]).toEqual({
      search: "joão",
      status: "all",
    });
  });

  it("mantém os filtros em navegações sem busca", () => {
    const { result } = renderFilters();
    act(() => result.current.filters[1]({ search: "x", status: "finished" }));

    act(() => result.current.navigate("/lista", { state: { other: true } }));

    expect(result.current.filters[0]).toEqual({
      search: "x",
      status: "finished",
    });
  });

  it("reaplica a mesma busca quando ela chega de novo", () => {
    const { result } = renderFilters({ search: "ana" });
    act(() => result.current.filters[1]({ search: "", status: "all" }));

    act(() => result.current.navigate("/lista", { state: { search: "ana" } }));

    expect(result.current.filters[0].search).toBe("ana");
  });
});
