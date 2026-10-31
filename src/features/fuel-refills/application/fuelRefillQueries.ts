import { createCrudQueries } from "@/shared/lib/query/createCrudQueries";
import { fuelRefillsRepository } from "../data/fuelRefillsRepository";

const fuelRefillQueries = createCrudQueries(
  "fuel-refills",
  fuelRefillsRepository,
);

export const fuelRefillKeys = fuelRefillQueries.keys;
export const {
  useList: useFuelRefills,
  useCreate: useCreateFuelRefill,
  useUpdate: useUpdateFuelRefill,
  useRemove: useDeleteFuelRefill,
} = fuelRefillQueries;
