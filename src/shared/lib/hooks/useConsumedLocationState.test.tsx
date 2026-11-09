import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useConsumedLocationState } from "./useConsumedLocationState";

const renderWithState = (state: unknown, path = "/pedidos?aba=1#topo") => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[{ ...splitPath(path), state }]}>
      {children}
    </MemoryRouter>
  );
  return renderHook(
    () => ({
      consumed: useConsumedLocationState<{ orderId?: number }>(),
      location: useLocation(),
    }),
    { wrapper },
  );
};

const splitPath = (path: string) => {
  const url = new URL(path, "http://localhost");
  return { pathname: url.pathname, search: url.search, hash: url.hash };
};

describe("useConsumedLocationState", () => {
  it("devolve o state recebido na navegação", () => {
    const { result } = renderWithState({ orderId: 7 });
    expect(result.current.consumed).toEqual({ orderId: 7 });
  });

  it("limpa o state do histórico mantendo caminho, query e hash", () => {
    const { result } = renderWithState({ orderId: 7 });
    expect(result.current.location.state).toBeNull();
    expect(result.current.location.pathname).toBe("/pedidos");
    expect(result.current.location.search).toBe("?aba=1");
    expect(result.current.location.hash).toBe("#topo");
  });

  it("mantém o valor consumido depois da limpeza", () => {
    const { result, rerender } = renderWithState({ orderId: 7 });
    rerender();
    expect(result.current.consumed).toEqual({ orderId: 7 });
  });

  it("devolve null e não navega quando não há state", () => {
    const { result } = renderWithState(null);
    expect(result.current.consumed).toBeNull();
    expect(result.current.location.key).toBe("default");
  });
});
