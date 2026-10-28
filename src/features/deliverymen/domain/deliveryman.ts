export interface DeliverymanSummary {
  id: number;
  name: string;
  lastName: string;
}

export const deliverymanFullName = (deliveryman: DeliverymanSummary): string =>
  `${deliveryman.name} ${deliveryman.lastName}`;
