import type { Delivery } from "@/features/deliveries";

export interface DistributionItem {
  name: string;
  value: number;
}

const countBy = (
  deliveries: Delivery[],
  labelOf: (delivery: Delivery) => string | undefined,
): DistributionItem[] => {
  const totals = new Map<string, number>();
  deliveries.forEach((delivery) => {
    const label = labelOf(delivery)?.trim();
    if (label) totals.set(label, (totals.get(label) ?? 0) + 1);
  });
  return Array.from(totals, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value || a.name.localeCompare(b.name),
  );
};

export const sumValues = (items: DistributionItem[]): number =>
  items.reduce((sum, item) => sum + item.value, 0);

export const summarizeDistribution = (deliveries: Delivery[]) => {
  const neighborhoods = countBy(deliveries, (d) => d.address?.neighborhood);
  const cities = countBy(deliveries, (d) => d.address?.city);
  const total = deliveries.length;
  const finished = deliveries.filter((d) => d.status === "finished").length;
  return {
    neighborhoods,
    cities,
    total,
    finished,
    overall: [
      { name: "Finalizadas", value: finished },
      { name: "Pendentes", value: Math.max(total - finished, 0) },
    ],
  };
};
