import { createCrudQueries } from "@/shared/lib/query/createCrudQueries";
import { deliverymenRepository } from "../data/deliverymenRepository";

const deliverymanQueries = createCrudQueries(
  "deliverymen",
  deliverymenRepository,
);

export const deliverymenKeys = deliverymanQueries.keys;
export const {
  useList: useDeliverymen,
  useCreate: useCreateDeliveryman,
  useUpdate: useUpdateDeliveryman,
  useRemove: useDeleteDeliveryman,
} = deliverymanQueries;
