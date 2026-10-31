import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserInput } from "../domain/user";
import { usersRepository } from "../data/usersRepository";

export const userKeys = {
  all: ["users"] as const,
};

const useInvalidateUsers = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all });
};

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
