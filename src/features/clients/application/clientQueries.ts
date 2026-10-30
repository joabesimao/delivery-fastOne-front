import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClientRegistrationInput } from "../domain/clientRegistration";
import { clientsRepository } from "../data/clientsRepository";

export const clientKeys = {
  all: ["clients"] as const,
};

export const useRegisterClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientRegistrationInput) =>
      clientsRepository.register(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clientKeys.all }),
  });
};
