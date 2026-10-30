import { createCrudQueries } from "@/shared/lib/query/createCrudQueries";
import { neighborhoodsRepository } from "../data/neighborhoodsRepository";

const neighborhoodQueries = createCrudQueries(
  "neighborhoods",
  neighborhoodsRepository,
);

export const neighborhoodKeys = neighborhoodQueries.keys;
export const {
  useList: useNeighborhoods,
  useCreate: useCreateNeighborhood,
  useUpdate: useUpdateNeighborhood,
  useRemove: useDeleteNeighborhood,
} = neighborhoodQueries;
