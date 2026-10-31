import type { ClientRegister } from "@/features/clients";
import { parseCurrencyToNumber, phoneMask } from "@/shared/lib/masks";

export interface DeliveryOrderClient {
  registerId: number;
  name: string;
  phone: string;
  address: ClientRegister["address"];
}

export interface DeliveryOrderFormValues {
  client: DeliveryOrderClient | null;
  deliverymanId: string;
  quantity: string;
  amount: string;
}

export type DeliveryOrderFormErrors = Partial<
  Record<"client" | "quantity" | "amount", string>
>;

export interface CreateDeliveryInput {
  registerId: number;
  deliverymanId?: number;
  quantity: string;
  amount: number;
}

export interface PreloadedDeliveryClient {
  id?: number;
  clientData?: {
    name: string;
    phone: string;
    address: ClientRegister["address"];
  };
}

export const toDeliveryOrderClient = (
  register: ClientRegister,
): DeliveryOrderClient => ({
  registerId: register.id,
  name: register.name,
  phone: phoneMask(register.phone),
  address: register.address,
});

export const toPreloadedOrderClient = (
  preloaded?: PreloadedDeliveryClient | null,
): DeliveryOrderClient | null =>
  preloaded?.clientData
    ? {
        registerId: preloaded.id ?? 0,
        name: preloaded.clientData.name,
        phone: phoneMask(preloaded.clientData.phone),
        address: {
          ...preloaded.clientData.address,
          reference: preloaded.clientData.address.reference || "",
        },
      }
    : null;

export const toDeliveryOrderFormValues = (
  client: DeliveryOrderClient | null = null,
): DeliveryOrderFormValues => ({
  client,
  deliverymanId: "",
  quantity: "",
  amount: "",
});

const normalizedAmount = (amount: string): number => {
  const parsed = parseCurrencyToNumber(amount);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const isPositiveAmount = (amount: string): boolean => {
  const parsed = parseCurrencyToNumber(amount);
  return amount !== "" && !Number.isNaN(parsed) && parsed > 0;
};

export const isPositiveQuantity = (quantity: string): boolean =>
  Boolean(quantity) && Number(quantity) > 0;

export const validateDeliveryOrderForm = (
  values: DeliveryOrderFormValues,
): DeliveryOrderFormErrors => {
  const errors: DeliveryOrderFormErrors = {};
  if (!values.client?.registerId) errors.client = "Selecione um cliente.";
  if (!isPositiveQuantity(values.quantity))
    errors.quantity = "Informe a quantidade.";
  if (!isPositiveAmount(values.amount)) errors.amount = "Informe o valor.";
  return errors;
};

export const toCreateDeliveryInput = (
  values: DeliveryOrderFormValues,
  registerId: number,
): CreateDeliveryInput => ({
  registerId,
  quantity: String(values.quantity),
  amount: normalizedAmount(values.amount),
  ...(values.deliverymanId && { deliverymanId: Number(values.deliverymanId) }),
});
