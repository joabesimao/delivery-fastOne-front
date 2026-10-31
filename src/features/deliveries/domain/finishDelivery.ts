import {
  formatCurrencyFromNumber,
  parseCurrencyToNumber,
} from "@/shared/lib/masks";
import type { Delivery } from "./delivery";
import { isPositiveAmount, isPositiveQuantity } from "./deliveryOrder";

export interface FinishDeliveryFormValues {
  quantity: string;
  amount: string;
  deliverymanId: string;
}

export type FinishDeliveryFormErrors = Partial<
  Record<keyof FinishDeliveryFormValues, string>
>;

export interface FinishDeliveryInput {
  quantity: string;
  amount: number;
  deliverymanId?: number;
  status: "finished";
}

export const toFinishDeliveryFormValues = (
  delivery: Delivery,
): FinishDeliveryFormValues => ({
  quantity: delivery.quantity,
  amount: formatCurrencyFromNumber(delivery.amount),
  deliverymanId: delivery.deliveryman ? String(delivery.deliveryman.id) : "",
});

export const validateFinishDeliveryForm = (
  values: FinishDeliveryFormValues,
): FinishDeliveryFormErrors => {
  const errors: FinishDeliveryFormErrors = {};
  if (!isPositiveQuantity(values.quantity.trim()))
    errors.quantity = "Informe a quantidade.";
  if (!isPositiveAmount(values.amount)) errors.amount = "Informe o valor.";
  if (!values.deliverymanId) errors.deliverymanId = "Selecione o entregador.";
  return errors;
};

export const toFinishDeliveryInput = (
  values: FinishDeliveryFormValues,
): FinishDeliveryInput => {
  const amount = parseCurrencyToNumber(values.amount);
  return {
    quantity: String(values.quantity),
    amount: Number.isNaN(amount) ? 0 : amount,
    status: "finished",
    ...(values.deliverymanId && {
      deliverymanId: Number(values.deliverymanId),
    }),
  };
};
