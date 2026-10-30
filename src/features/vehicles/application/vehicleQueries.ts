import { createCrudQueries } from "@/shared/lib/query/createCrudQueries";
import { vehiclesRepository } from "../data/vehiclesRepository";

const vehicleQueries = createCrudQueries("vehicles", vehiclesRepository);

export const vehicleKeys = vehicleQueries.keys;
export const {
  useList: useVehicles,
  useCreate: useCreateVehicle,
  useUpdate: useUpdateVehicle,
  useRemove: useDeleteVehicle,
} = vehicleQueries;
