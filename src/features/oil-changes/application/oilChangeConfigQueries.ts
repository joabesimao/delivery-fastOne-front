import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OilChangeConfig } from "../domain/oilChangeConfig";
import { oilChangeConfigRepository } from "../data/oilChangeConfigRepository";

export const oilChangeConfigKeys = {
  all: ["oil-change-config"] as const,
};

export const useOilChangeConfig = () =>
  useQuery({
    queryKey: oilChangeConfigKeys.all,
    queryFn: () => oilChangeConfigRepository.get(),
    retry: false,
  });

export const useSaveOilChangeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: OilChangeConfig) =>
      oilChangeConfigRepository.save(config),
    onSuccess: (_, config) =>
      queryClient.setQueryData(oilChangeConfigKeys.all, config),
  });
};
