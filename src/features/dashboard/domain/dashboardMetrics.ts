import type { Delivery, DeliveryStatus } from "@/features/deliveries";

export interface DashboardMetrics {
  clients: number;
  deliverymen: number;
  activeDeliveries: number;
  deliveredRevenue: number;
  deliveredRevenuePreviousPeriod: number | null;
  cities: number;
  neighborhoods: number;
}

export interface PerformanceDay {
  date: string;
  label: string;
  total: number;
}

export interface DashboardPerformance {
  days: PerformanceDay[];
  totalOrders: number;
  avgDeliveryMinutes: number | null;
  peakDay: PerformanceDay | null;
}

export type DeliveryStatusFilter = DeliveryStatus | "all";

export const LIVE_FEED_PAGE_SIZE = 5;

export const revenueDelta = (
  metrics: DashboardMetrics | undefined,
): string | null => {
  const previous = metrics?.deliveredRevenuePreviousPeriod;
  const current = metrics?.deliveredRevenue;
  if (previous == null || current === undefined || previous === 0) return null;
  const percent = ((current - previous) / previous) * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
};

export const maxDailyVolume = (
  performance: DashboardPerformance | undefined,
): number =>
  performance?.days.length
    ? Math.max(...performance.days.map((d) => d.total), 1)
    : 1;

export const filterByStatus = (
  deliveries: Delivery[],
  status: DeliveryStatusFilter,
): Delivery[] =>
  status === "all" ? deliveries : deliveries.filter((d) => d.status === status);

export const initialsOf = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

export const greetingName = ({
  name,
  email,
}: {
  name: string;
  email: string;
}): string => {
  if (name) return name;
  if (!email) return "Operador";
  if (email.toLowerCase() === "admin@fastone.local") return "Operador Admin";
  return email;
};
