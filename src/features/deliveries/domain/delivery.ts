export type DeliveryStatus = "actived" | "delivered" | "finished";

export interface DeliveryDeliveryman {
  id: number;
  name: string;
  lastName: string;
  phone: string;
}

export interface DeliveryClient {
  name: string;
  phone: string;
}

export interface DeliveryAddress {
  street: string;
  numberHouse: string;
  neighborhood: string;
  city: string;
  reference: string;
}

export interface Delivery {
  id: number;
  quantity: string;
  amount: number;
  createdAt: string;
  receivedAt: string | null;
  finishedAt: string | null;
  status: DeliveryStatus;
  deliverymanId: number | null;
  deliveryman: DeliveryDeliveryman | null;
  unitStoreName: string | null;
  client: DeliveryClient;
  address: DeliveryAddress;
}

export const isFinishedDelivery = (delivery: Delivery): boolean =>
  delivery.status === "finished";

export const deliveryDeliverymanName = (
  deliveryman: Pick<DeliveryDeliveryman, "name" | "lastName">,
): string => `${deliveryman.name} ${deliveryman.lastName}`.trim();

export const deliveryStreetLine = ({ street, numberHouse }: DeliveryAddress) =>
  `${street}, ${numberHouse}`;
