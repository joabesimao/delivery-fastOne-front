import { createCrudQueries } from "@/shared/lib/query/createCrudQueries";
import { DELIVERIES_SCOPE } from "@/shared/lib/query/queryScopes";
import { deliverymenRepository } from "../data/deliverymenRepository";

const deliverymanQueries = createCrudQueries(
  "deliverymen",
  deliverymenRepository,
  { dependentScopes: [DELIVERIES_SCOPE] },
);

export const deliverymenKeys = deliverymanQueries.keys;
export const {
  useList: useDeliverymen,
  useCreate: useCreateDeliveryman,
  useUpdate: useUpdateDeliveryman,
  useRemove: useDeleteDeliveryman,
} = deliverymanQueries;
