import { createCrudQueries } from "@/shared/lib/query/createCrudQueries";
import { citiesRepository } from "../data/citiesRepository";

const cityQueries = createCrudQueries("cities", citiesRepository);

export const cityKeys = cityQueries.keys;
export const {
  useList: useCities,
  useCreate: useCreateCity,
  useUpdate: useUpdateCity,
  useRemove: useDeleteCity,
} = cityQueries;
