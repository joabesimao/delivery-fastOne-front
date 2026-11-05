import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useResettablePage } from "./useResettablePage";

describe("useResettablePage", () => {
  it("começa na página inicial informada", () => {
    const { result } = renderHook(() => useResettablePage("a", 2));
    expect(result.current[0]).toBe(2);
  });

  it("usa a página 0 por padrão", () => {
    const { result } = renderHook(() => useResettablePage("a"));
    expect(result.current[0]).toBe(0);
  });

  it("atualiza a página enquanto a chave se mantém", () => {
    const { result } = renderHook(() => useResettablePage("a"));
    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);
  });

  it("volta para a página inicial quando a chave muda", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => useResettablePage(resetKey, 1),
      { initialProps: { resetKey: "a" } },
    );
    act(() => result.current[1](5));
    rerender({ resetKey: "b" });
    expect(result.current[0]).toBe(1);
  });

  it("mantém a página escolhida após a chave mudar e voltar a mudar a página", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => useResettablePage(resetKey),
      { initialProps: { resetKey: "a" } },
    );
    rerender({ resetKey: "b" });
    act(() => result.current[1](4));
    expect(result.current[0]).toBe(4);
  });
});
