import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { clientsListRepository } from "../data/clientsListRepository";
import { clientsRepository } from "../data/clientsRepository";
import {
  clientKeys,
  useClientRegisters,
  useClients,
  useRegisterClient,
  useSetClientActive,
  useUpdateClient,
} from "./clientQueries";

vi.mock("../data/clientsListRepository", () => ({
  clientsListRepository: { list: vi.fn(), update: vi.fn(), setActive: vi.fn() },
}));

vi.mock("../data/clientsRepository", () => ({
  clientsRepository: { listRegisters: vi.fn(), register: vi.fn() },
}));

describe("clientKeys", () => {
  it("monta as keys a partir de all", () => {
    expect(clientKeys.all).toEqual(["clients"]);
    expect(clientKeys.list()).toEqual(["clients", "list"]);
    expect(clientKeys.registers()).toEqual(["clients", "registers"]);
  });
});

describe("consultas de clientes", () => {
  it("useClients retorna a lista", async () => {
    vi.mocked(clientsListRepository.list).mockResolvedValue([
      { id: 1 },
    ] as never);
    const { result } = renderHookWithQueryClient(() => useClients());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1 }]);
  });

  it("useClientRegisters retorna os registros", async () => {
    const registers = { cpfs: new Set(["1"]) };
    vi.mocked(clientsRepository.listRegisters).mockResolvedValue(
      registers as never,
    );
    const { result } = renderHookWithQueryClient(() => useClientRegisters());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(registers);
  });

  it("expõe erro quando a listagem falha", async () => {
    vi.mocked(clientsListRepository.list).mockRejectedValue(new Error("x"));
    const { result } = renderHookWithQueryClient(() => useClients());
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("mutações de clientes", () => {
  it("useRegisterClient registra e invalida", async () => {
    vi.mocked(clientsRepository.register).mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useRegisterClient(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const input = { name: "Ana" } as never;
    await act(() => result.current.mutateAsync(input));
    expect(clientsRepository.register).toHaveBeenCalledWith(input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clientKeys.all });
  });

  it("useUpdateClient atualiza pelo registerId com o input", async () => {
    vi.mocked(clientsListRepository.update).mockResolvedValue(
      undefined as never,
    );
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useUpdateClient(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const input = { name: "Bia" } as never;
    await act(() =>
      result.current.mutateAsync({ id: 1, registerId: 2, input }),
    );
    expect(clientsListRepository.update).toHaveBeenCalledWith(2, input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clientKeys.all });
  });

  it("useUpdateClient invalida também quando a atualização falha", async () => {
    vi.mocked(clientsListRepository.update).mockRejectedValue(new Error("x"));
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useUpdateClient(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() =>
      result.current
        .mutateAsync({ id: 1, registerId: 2, input: {} as never })
        .catch(() => undefined),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clientKeys.all });
  });

  it("useSetClientActive altera o status e invalida", async () => {
    vi.mocked(clientsListRepository.setActive).mockResolvedValue(
      undefined as never,
    );
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useSetClientActive(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() => result.current.mutateAsync({ id: 5, active: false }));
    expect(clientsListRepository.setActive).toHaveBeenCalledWith(5, false);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clientKeys.all });
  });

  it("useRegisterClient não invalida quando falha", async () => {
    vi.mocked(clientsRepository.register).mockRejectedValue(new Error("x"));
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useRegisterClient(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() =>
      result.current.mutateAsync({} as never).catch(() => undefined),
    );
    expect(invalidate).not.toHaveBeenCalled();
  });
});
