import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VehicleInput } from "../domain/vehicle";
import { vehiclesRepository } from "../data/vehiclesRepository";

export const vehicleKeys = {
  all: ["vehicles"] as const,
  list: () => [...vehicleKeys.all, "list"] as const,
};

export const useVehicles = () =>
  useQuery({
    queryKey: vehicleKeys.list(),
    queryFn: vehiclesRepository.list,
  });

const useInvalidateVehicles = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
};

export const useCreateVehicle = () => {
  const invalidate = useInvalidateVehicles();
  return useMutation({
    mutationFn: (input: VehicleInput) => vehiclesRepository.create(input),
    onSuccess: invalidate,
  });
};

export const useUpdateVehicle = () => {
  const invalidate = useInvalidateVehicles();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: VehicleInput }) =>
      vehiclesRepository.update(id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteVehicle = () => {
  const invalidate = useInvalidateVehicles();
  return useMutation({
    mutationFn: (id: number) => vehiclesRepository.remove(id),
    onSuccess: invalidate,
  });
};
