import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna o valor inicial imediatamente", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 300));
    expect(result.current).toBe("a");
  });

  it("só atualiza depois do atraso", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );
    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("b");
  });

  it("reinicia o atraso a cada mudança e emite só o último valor", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );
    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("c");
  });

  it("cancela o timer pendente ao desmontar", () => {
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );
    rerender({ value: "b" });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
