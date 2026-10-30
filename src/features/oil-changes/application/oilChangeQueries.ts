import { createCrudQueries } from "@/shared/lib/query/createCrudQueries";
import { oilChangesRepository } from "../data/oilChangesRepository";

const oilChangeQueries = createCrudQueries("oil-changes", oilChangesRepository);

export const oilChangeKeys = oilChangeQueries.keys;
export const {
  useList: useOilChanges,
  useCreate: useCreateOilChange,
  useUpdate: useUpdateOilChange,
  useRemove: useDeleteOilChange,
} = oilChangeQueries;
