import { shiftDateOnly, todayIsoDate } from "@/shared/lib/date/dateOnly";

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

export const todayInputRange = (): DateInputRange => {
  const today = todayIsoDate();
  return { start: today, end: today };
};

export const rangeForPeriod = (
  period: DashboardPeriod,
  custom: DateInputRange,
  now = new Date(),
): DashboardRange => {
  const today = todayIsoDate(now);
  if (period === "7days")
    return { startDate: shiftDateOnly(today, -6), endDate: today };
  if (period === "30days")
    return { startDate: shiftDateOnly(today, -29), endDate: today };
  if (period === "custom")
    return { startDate: custom.start || today, endDate: custom.end || today };
  return { startDate: today, endDate: today };
};
