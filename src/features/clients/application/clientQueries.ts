import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ClientRegistrationInput } from "../domain/clientRegistration";
import { clientsRepository } from "../data/clientsRepository";

export const clientKeys = {
  all: ["clients"] as const,
  registers: () => [...clientKeys.all, "registers"] as const,
};

export const useClientRegisters = () =>
  useQuery({
    queryKey: clientKeys.registers(),
    queryFn: () => clientsRepository.listRegisters(),
  });

export const useRegisterClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientRegistrationInput) =>
      clientsRepository.register(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: clientKeys.all }),
  });
};
