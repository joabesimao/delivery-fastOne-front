import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CrudRepository } from "@/shared/api/createCrudRepository";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { createCrudQueries, getBusyRowId } from "./createCrudQueries";

interface Item {
  id: number;
  name: string;
}

interface Input {
  name: string;
}

const makeRepository = (): CrudRepository<Item, Input> => ({
  list: vi.fn().mockResolvedValue([{ id: 1, name: "A" }]),
  create: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
});

describe("createCrudQueries", () => {
  describe("keys", () => {
    const { keys } = createCrudQueries("items", makeRepository());

    it("all usa apenas o escopo", () => {
      expect(keys.all).toEqual(["items"]);
    });

    it("list sem filtros não inclui filtros na key", () => {
      expect(keys.list()).toEqual(["items", "list"]);
    });

    it("list com filtros inclui os filtros na key", () => {
      expect(keys.list({ q: "x" })).toEqual(["items", "list", { q: "x" }]);
    });
  });

  describe("useList", () => {
    it("retorna os dados do repositório", async () => {
      const repository = makeRepository();
      const { useList } = createCrudQueries("items", repository);
      const { result } = renderHookWithQueryClient(() => useList());
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([{ id: 1, name: "A" }]);
      expect(repository.list).toHaveBeenCalledWith(undefined);
    });

    it("repassa os filtros ao repositório e usa a key com filtros", async () => {
      const repository = makeRepository();
      const { useList, keys } = createCrudQueries("items", repository);
      const { result, queryClient } = renderHookWithQueryClient(() =>
        useList({ city: "SP" }),
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(repository.list).toHaveBeenCalledWith({ city: "SP" });
      expect(queryClient.getQueryData(keys.list({ city: "SP" }))).toBeDefined();
    });

    it("expõe o erro quando o repositório falha", async () => {
      const repository = makeRepository();
      vi.mocked(repository.list).mockRejectedValue(new Error("falhou"));
      const { useList } = createCrudQueries("items", repository);
      const { result } = renderHookWithQueryClient(() => useList());
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe("mutações", () => {
    it("useCreate chama create e invalida o escopo", async () => {
      const repository = makeRepository();
      const { useCreate, keys } = createCrudQueries("items", repository);
      const { result, queryClient } = renderHookWithQueryClient(() =>
        useCreate(),
      );
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      await act(() => result.current.mutateAsync({ name: "B" }));
      expect(repository.create).toHaveBeenCalledWith({ name: "B" });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: keys.all });
    });

    it("useUpdate chama update com id e input e invalida", async () => {
      const repository = makeRepository();
      const { useUpdate, keys } = createCrudQueries("items", repository);
      const { result, queryClient } = renderHookWithQueryClient(() =>
        useUpdate(),
      );
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      await act(() =>
        result.current.mutateAsync({ id: 7, input: { name: "C" } }),
      );
      expect(repository.update).toHaveBeenCalledWith(7, { name: "C" });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: keys.all });
    });

    it("useRemove chama remove com o id e invalida", async () => {
      const repository = makeRepository();
      const { useRemove, keys } = createCrudQueries("items", repository);
      const { result, queryClient } = renderHookWithQueryClient(() =>
        useRemove(),
      );
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      await act(() => result.current.mutateAsync(9));
      expect(repository.remove).toHaveBeenCalledWith(9);
      expect(invalidate).toHaveBeenCalledWith({ queryKey: keys.all });
    });

    it("não invalida quando a mutação falha", async () => {
      const repository = makeRepository();
      vi.mocked(repository.create).mockRejectedValue(new Error("falhou"));
      const { useCreate } = createCrudQueries("items", repository);
      const { result, queryClient } = renderHookWithQueryClient(() =>
        useCreate(),
      );
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      await act(() =>
        result.current.mutateAsync({ name: "B" }).catch(() => {}),
      );
      expect(invalidate).not.toHaveBeenCalled();
    });

    it("a lista é recarregada após criar", async () => {
      const repository = makeRepository();
      const { useList, useCreate } = createCrudQueries("items", repository);
      const { result } = renderHookWithQueryClient(() => ({
        list: useList(),
        create: useCreate(),
      }));
      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      await act(() => result.current.create.mutateAsync({ name: "B" }));
      await waitFor(() => expect(repository.list).toHaveBeenCalledTimes(2));
    });
  });
});

describe("getBusyRowId", () => {
  const idle = { isPending: false };

  it("retorna null sem mutações pendentes", () => {
    expect(getBusyRowId(idle, idle)).toBeNull();
  });

  it("retorna o id da atualização pendente", () => {
    expect(getBusyRowId({ isPending: true, variables: { id: 4 } }, idle)).toBe(
      4,
    );
  });

  it("retorna o id da remoção pendente", () => {
    expect(getBusyRowId(idle, { isPending: true, variables: 8 })).toBe(8);
  });

  it("prioriza a atualização quando ambas estão pendentes", () => {
    expect(
      getBusyRowId(
        { isPending: true, variables: { id: 4 } },
        { isPending: true, variables: 8 },
      ),
    ).toBe(4);
  });

  it("ignora mutação pendente sem variáveis", () => {
    expect(getBusyRowId({ isPending: true }, idle)).toBeNull();
  });

  it("usa a remoção quando a atualização pendente não tem variáveis", () => {
    expect(
      getBusyRowId({ isPending: true }, { isPending: true, variables: 8 }),
    ).toBe(8);
  });

  it("aceita id 0 na atualização e na exclusão", () => {
    expect(getBusyRowId({ isPending: true, variables: { id: 0 } }, idle)).toBe(
      0,
    );
    expect(getBusyRowId(idle, { isPending: true, variables: 0 })).toBe(0);
  });
});
