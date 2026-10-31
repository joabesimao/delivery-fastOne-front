import {
  deliveryDeliverymanName,
  isFinishedDelivery,
  type Delivery,
  type DeliveryStatus,
} from "./delivery";

export const ALL = "all";

export type DeliveryProgressFilter = typeof ALL | "active" | "finished";

export interface DeliveryListFilters {
  search: string;
  progress: DeliveryProgressFilter;
  deliverymanId: string;
  city: string;
  neighborhood: string;
}

export interface FinishableDeliveryFilters {
  search: string;
  status: typeof ALL | DeliveryStatus;
  deliverymanId: string;
}

export interface NamedOption {
  id: number;
  name: string;
}

const includesTerm = (value: string, term: string) =>
  value.toLowerCase().includes(term);

const matchesDeliveryman = (delivery: Delivery, deliverymanId: string) =>
  deliverymanId === ALL ||
  String(delivery.deliveryman?.id ?? "") === deliverymanId;

const sortedUnique = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );

export const filterDeliveries = (
  deliveries: Delivery[],
  filters: DeliveryListFilters,
): Delivery[] => {
  const term = filters.search.trim().toLowerCase();

  return deliveries.filter((delivery) => {
    const matchesProgress =
      filters.progress === ALL ||
      (filters.progress === "active") !== isFinishedDelivery(delivery);
    const matchesCity =
      filters.city === ALL || delivery.address.city === filters.city;
    const matchesNeighborhood =
      filters.neighborhood === ALL ||
      delivery.address.neighborhood === filters.neighborhood;
    const matchesSearch =
      !term ||
      includesTerm(delivery.client.name, term) ||
      includesTerm(delivery.address.street, term) ||
      String(delivery.id).includes(term);

    return (
      matchesProgress &&
      matchesDeliveryman(delivery, filters.deliverymanId) &&
      matchesCity &&
      matchesNeighborhood &&
      matchesSearch
    );
  });
};

export const filterFinishableDeliveries = (
  deliveries: Delivery[],
  filters: FinishableDeliveryFilters,
): Delivery[] => {
  const term = filters.search.trim().toLowerCase();

  return deliveries.filter((delivery) => {
    const deliverymanName = `${delivery.deliveryman?.name ?? ""} ${delivery.deliveryman?.lastName ?? ""}`;
    const matchesSearch =
      !term ||
      includesTerm(delivery.client.name, term) ||
      String(delivery.id).includes(term) ||
      includesTerm(delivery.address.city, term) ||
      includesTerm(delivery.address.neighborhood, term) ||
      includesTerm(deliverymanName, term);
    const matchesStatus =
      filters.status === ALL || delivery.status === filters.status;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDeliveryman(delivery, filters.deliverymanId)
    );
  });
};

export const countActiveDeliveries = (deliveries: Delivery[]): number =>
  deliveries.filter((delivery) => !isFinishedDelivery(delivery)).length;

export const deliverymenOfDeliveries = (
  deliveries: Delivery[],
): NamedOption[] => {
  const names = new Map<number, string>();
  deliveries.forEach(({ deliveryman }) => {
    if (deliveryman?.id)
      names.set(deliveryman.id, deliveryDeliverymanName(deliveryman));
  });
  return Array.from(names, ([id, name]) => ({ id, name })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

export const citiesOfDeliveries = (deliveries: Delivery[]): string[] =>
  sortedUnique(deliveries.map((delivery) => delivery.address.city));

export const neighborhoodsOfDeliveries = (
  deliveries: Delivery[],
  city: string,
): string[] =>
  sortedUnique(
    deliveries
      .filter((delivery) => city === ALL || delivery.address.city === city)
      .map((delivery) => delivery.address.neighborhood),
  );
