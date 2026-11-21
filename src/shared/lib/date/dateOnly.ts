import { businessDayKey } from "./formatDate";

export const todayIsoDate = (now: Date = new Date()): string =>
  businessDayKey(now);

export const isoToDateOnly = (value: string): string => value.slice(0, 10);

export const shiftDateOnly = (value: string, days: number): string => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
};

export const formatDateOnly = (value: string): string => {
  const [year, month, day] = isoToDateOnly(value).split("-");
  return `${day}/${month}/${year}`;
};

export const formatUtcDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};
