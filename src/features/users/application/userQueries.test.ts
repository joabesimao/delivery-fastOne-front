import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/renderWithQueryClient";
import { usersRepository } from "../data/usersRepository";
import {
  userKeys,
  useCreateUser,
  useDeleteUser,
  useSetUserActive,
  useUpdateUser,
  useUsers,
} from "./userQueries";

vi.mock("../data/usersRepository", () => ({
  usersRepository: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setActive: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("userKeys", () => {
  it("inclui os parâmetros na key da lista", () => {
    expect(userKeys.all).toEqual(["users"]);
    expect(userKeys.list({ q: "a" })).toEqual(["users", "list", { q: "a" }]);
  });
});

describe("useUsers", () => {
  it("lista usuários com os parâmetros", async () => {
    vi.mocked(usersRepository.list).mockResolvedValue([{ id: 1 }] as never);
    const { result } = renderHookWithQueryClient(() => useUsers({ q: "a" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersRepository.list).toHaveBeenCalledWith({ q: "a" });
    expect(result.current.data).toEqual([{ id: 1 }]);
  });

  it("expõe erro quando a listagem falha", async () => {
    vi.mocked(usersRepository.list).mockRejectedValue(new Error("x"));
    const { result } = renderHookWithQueryClient(() => useUsers({}));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("mutações de usuários", () => {
  it("useCreateUser cria e invalida", async () => {
    vi.mocked(usersRepository.create).mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useCreateUser(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const input = { name: "U" } as never;
    await act(() => result.current.mutateAsync(input));
    expect(usersRepository.create).toHaveBeenCalledWith(input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: userKeys.all });
  });

  it("useUpdateUser atualiza com id e input", async () => {
    vi.mocked(usersRepository.update).mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useUpdateUser(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const input = { name: "V" } as never;
    await act(() => result.current.mutateAsync({ id: 2, input }));
    expect(usersRepository.update).toHaveBeenCalledWith(2, input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: userKeys.all });
  });

  it("useSetUserActive altera o status", async () => {
    vi.mocked(usersRepository.setActive).mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useSetUserActive(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() => result.current.mutateAsync({ id: 3, active: true }));
    expect(usersRepository.setActive).toHaveBeenCalledWith(3, true);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: userKeys.all });
  });

  it("useDeleteUser remove pelo id", async () => {
    vi.mocked(usersRepository.remove).mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useDeleteUser(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() => result.current.mutateAsync(6));
    expect(usersRepository.remove).toHaveBeenCalledWith(6);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: userKeys.all });
  });

  it("não invalida quando a mutação falha", async () => {
    vi.mocked(usersRepository.create).mockRejectedValue(new Error("x"));
    const { result, queryClient } = renderHookWithQueryClient(() =>
      useCreateUser(),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(() =>
      result.current.mutateAsync({} as never).catch(() => undefined),
    );
    expect(invalidate).not.toHaveBeenCalled();
  });
});
