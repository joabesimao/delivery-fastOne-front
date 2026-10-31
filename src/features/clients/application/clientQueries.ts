import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ClientUpdateInput } from "../domain/client";
import type { ClientRegistrationInput } from "../domain/clientRegistration";
import { clientsListRepository } from "../data/clientsListRepository";
import { clientsRepository } from "../data/clientsRepository";

export const clientKeys = {
  all: ["clients"] as const,
  list: () => [...clientKeys.all, "list"] as const,
  registers: () => [...clientKeys.all, "registers"] as const,
};

const useInvalidateClients = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: clientKeys.all });
};

export const useClients = () =>
  useQuery({
    queryKey: clientKeys.list(),
    queryFn: () => clientsListRepository.list(),
  });

export const useClientRegisters = () =>
  useQuery({
    queryKey: clientKeys.registers(),
    queryFn: () => clientsRepository.listRegisters(),
  });

export const useRegisterClient = () => {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (input: ClientRegistrationInput) =>
      clientsRepository.register(input),
    onSuccess: invalidate,
  });
};

export const useUpdateClient = () => {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: ({
      id,
      addressId,
      input,
    }: {
      id: number;
      addressId: number;
      input: ClientUpdateInput;
    }) => clientsListRepository.update(id, addressId, input),
    onSuccess: invalidate,
  });
};

export const useSetClientActive = () => {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      clientsListRepository.setActive(id, active),
    onSuccess: invalidate,
  });
};
