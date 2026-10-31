import {
  deliveryDeliverymanName,
  isFinishedDelivery,
  type Delivery,
  type DeliveryStatus,
} from "./delivery";

export interface DeliverySummary {
  totalOrders: number;
  finishedCount: number;
  totalRevenue: number;
  averageTicket: number;
}

export interface DeliverymanPerformance {
  key: string;
  name: string;
  phone: string;
  total: number;
  finished: number;
  active: number;
  revenue: number;
  completionRate: number;
}

export interface CountByName {
  name: string;
  value: number;
}

const TOP_DELIVERYMEN = 3;
const TOP_NEIGHBORHOODS = 7;
const DELIVERY_STATUSES: DeliveryStatus[] = [
  "actived",
  "delivered",
  "finished",
];

const amountOf = (delivery: Delivery) => Number(delivery.amount || 0);

export const summarizeDeliveries = (
  deliveries: Delivery[],
): DeliverySummary => {
  const finished = deliveries.filter(isFinishedDelivery);
  const totalRevenue = finished.reduce((sum, d) => sum + amountOf(d), 0);
  return {
    totalOrders: deliveries.length,
    finishedCount: finished.length,
    totalRevenue,
    averageTicket: finished.length > 0 ? totalRevenue / finished.length : 0,
  };
};

export const topDeliverymenPerformance = (
  deliveries: Delivery[],
): DeliverymanPerformance[] => {
  const byKey = new Map<string, DeliverymanPerformance>();

  deliveries.forEach((delivery) => {
    const key = delivery.deliverymanId
      ? `dm-${delivery.deliverymanId}`
      : `order-${delivery.id}`;
    const current = byKey.get(key) ?? {
      key,
      name: delivery.deliveryman
        ? deliveryDeliverymanName(delivery.deliveryman)
        : "Sem entregador",
      phone: delivery.deliveryman?.phone || "-",
      total: 0,
      finished: 0,
      active: 0,
      revenue: 0,
      completionRate: 0,
    };

    current.total += 1;
    if (isFinishedDelivery(delivery)) {
      current.finished += 1;
      current.revenue += amountOf(delivery);
    } else {
      current.active += 1;
    }
    byKey.set(key, current);
  });

  return Array.from(byKey.values())
    .map((item) => ({
      ...item,
      completionRate:
        item.total > 0 ? Math.round((item.finished / item.total) * 100) : 0,
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        b.revenue - a.revenue ||
        a.name.localeCompare(b.name),
    )
    .slice(0, TOP_DELIVERYMEN);
};

export const countByNeighborhood = (deliveries: Delivery[]): CountByName[] => {
  const counts = new Map<string, number>();
  deliveries.forEach((delivery) => {
    const name = delivery.address.neighborhood.trim() || "Sem bairro";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return Array.from(counts, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, TOP_NEIGHBORHOODS);
};

export const countByStatus = (
  deliveries: Delivery[],
): { status: DeliveryStatus; value: number }[] =>
  DELIVERY_STATUSES.map((status) => ({
    status,
    value: deliveries.filter((delivery) => delivery.status === status).length,
  }));

export const initialsOf = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
