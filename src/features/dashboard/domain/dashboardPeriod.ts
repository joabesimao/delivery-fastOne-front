export type DashboardPeriod = "today" | "7days" | "30days" | "custom";

export interface DateInputRange {
  start: string;
  end: string;
}

export interface DashboardRange {
  startDate: string;
  endDate: string;
}

export const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7days", label: "Últimos 7 dias" },
  { value: "30days", label: "30 dias" },
  { value: "custom", label: "Personalizado" },
];

export const toInputDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const toRange = (start: Date, end: Date): DashboardRange => ({
  startDate: startOfDay(start).toISOString(),
  endDate: endOfDay(end).toISOString(),
});

const daysAgo = (now: Date, days: number): Date => {
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return start;
};

export const todayInputRange = (): DateInputRange => {
  const today = toInputDate(new Date());
  return { start: today, end: today };
};

export const rangeForPeriod = (
  period: DashboardPeriod,
  custom: DateInputRange,
  now = new Date(),
): DashboardRange => {
  if (period === "7days") return toRange(daysAgo(now, 6), now);
  if (period === "30days") return toRange(daysAgo(now, 29), now);
  if (period === "custom") {
    const start = custom.start ? new Date(`${custom.start}T00:00:00`) : now;
    const end = custom.end ? new Date(`${custom.end}T23:59:59`) : now;
    return toRange(start, end);
  }
  return toRange(now, now);
};
