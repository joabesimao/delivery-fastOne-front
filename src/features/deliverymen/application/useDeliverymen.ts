import { useQuery } from "@tanstack/react-query";
import { deliverymenRepository } from "../data/deliverymenRepository";

export const deliverymenKeys = {
  all: ["deliverymen"] as const,
  list: () => [...deliverymenKeys.all, "list"] as const,
};

export const useDeliverymen = () =>
  useQuery({
    queryKey: deliverymenKeys.list(),
    queryFn: deliverymenRepository.list,
  });
