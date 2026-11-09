import { useQuery } from "@tanstack/react-query";
import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { useRefreshActiveQueries } from "./useRefreshActiveQueries";

describe("useRefreshActiveQueries", () => {
  it("refaz as queries ativas e informa enquanto recarrega", async () => {
    let resolveSecond: (value: string) => void = () => {};
    const queryFn = vi
      .fn()
      .mockResolvedValueOnce("primeira")
      .mockImplementationOnce(
        () => new Promise<string>((resolve) => (resolveSecond = resolve)),
      );
    const { result } = renderHookWithQueryClient(() => {
      useQuery({ queryKey: ["item"], queryFn });
      return useRefreshActiveQueries();
    });
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.refreshing).toBe(false));

    act(() => {
      void result.current.refresh();
    });

    await waitFor(() => expect(result.current.refreshing).toBe(true));
    expect(queryFn).toHaveBeenCalledTimes(2);

    act(() => resolveSecond("segunda"));
    await waitFor(() => expect(result.current.refreshing).toBe(false));
  });

  it("marca as queries inativas como desatualizadas sem refazê-las", async () => {
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useRefreshActiveQueries(),
    );
    const queryFn = vi.fn().mockResolvedValue("ok");
    await queryClient.prefetchQuery({ queryKey: ["inativa"], queryFn });

    await act(() => result.current.refresh());

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryState(["inativa"])?.isInvalidated).toBe(true);
  });
});
