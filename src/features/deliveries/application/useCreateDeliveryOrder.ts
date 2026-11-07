import type { DeliverySheet } from "../domain/deliverySheet";
import {
  toCreateDeliveryInput,
  type DeliveryOrderClient,
  type DeliveryOrderFormValues,
} from "../domain/deliveryOrder";
import { useCreateDelivery } from "./deliveryQueries";

interface CreateDeliveryOrderOptions {
  print: (sheet: DeliverySheet) => Promise<void>;
  onPrintError: () => void;
}

export const useCreateDeliveryOrder = ({
  print,
  onPrintError,
}: CreateDeliveryOrderOptions) => {
  const createDelivery = useCreateDelivery();

  return async (
    values: DeliveryOrderFormValues,
    client: DeliveryOrderClient,
  ): Promise<void> => {
    const input = toCreateDeliveryInput(values, client.registerId);
    const { id } = await createDelivery.mutateAsync(input);
    print({
      orderId: id,
      createdAt: new Date().toISOString(),
      client,
      quantity: input.quantity,
      amount: input.amount,
    }).catch(onPrintError);
  };
};
