import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserInput } from "../domain/user";
import { usersRepository } from "../data/usersRepository";

export const userKeys = {
  all: ["users"] as const,
  list: (params: Record<string, string>) =>
    [...userKeys.all, "list", params] as const,
};

const useInvalidateUsers = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all });
};

export const useUsers = (params: Record<string, string>) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersRepository.list(params),
  });

export const useCreateUser = () => {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (input: UserInput) => usersRepository.create(input),
    onSuccess: invalidate,
  });
};

export const useUpdateUser = () => {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UserInput }) =>
      usersRepository.update(id, input),
    onSuccess: invalidate,
  });
};

export const useSetUserActive = () => {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      usersRepository.setActive(id, active),
    onSuccess: invalidate,
  });
};

export const useDeleteUser = () => {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: number) => usersRepository.remove(id),
    onSuccess: invalidate,
  });
};
