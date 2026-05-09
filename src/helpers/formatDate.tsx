import dayjs from "dayjs";
import { format } from "date-fns";

export const formatDate = (
  date?: string | Date | null,
  pattern: string = "DD/MM/YYYY",
): string => {
  if (!date) return "";
  const d = dayjs(date);
  return d.isValid() ? d.format(pattern) : "";
};

export const formatDateLocal = (
  date?: string | Date | null,
  pattern: string = "DD/MM/YYYY",
): string => {
  if (!date) return "";
  const dateStr = typeof date === "string" ? date : date.toISOString();
  const d = dayjs(dateStr.replace("Z", ""));
  return d.isValid() ? d.format(pattern) : "";
};

export const formatDateWithoutTimezone = (
  value?: string | Date | null,
  pattern: string = "dd/MM/yyyy",
): string => {
  if (!value) return "";

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? "" : format(value, pattern);
  }

  if (typeof value !== "string") return "";

  const dateStr = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = dateStr.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return isNaN(date.getTime()) ? "" : format(date, pattern);
};

export const parseDateOnlyLocal = (
  value?: string | Date | null,
): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string") return null;

  const dateStr = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = dateStr.split("-").map(Number);
  if ([year, month, day].some((part) => !Number.isFinite(part))) return null;

  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  return isNaN(date.getTime()) ? null : date;
};

export const formatDateOnlyLocal = (value?: string | Date | null): string => {
  const date = parseDateOnlyLocal(value);
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
