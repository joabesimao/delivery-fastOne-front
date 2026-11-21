import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

dayjs.extend(relativeTime);

export const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

type DateValue = string | Date | null | undefined;

const businessFormatter = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: BUSINESS_TIME_ZONE,
    ...options,
  });

const DATE = businessFormatter({
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME = businessFormatter({
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const DAY_TIME = businessFormatter({
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const TIME = businessFormatter({ hour: "2-digit", minute: "2-digit" });

const LONG_DATE = businessFormatter({
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const DAY_KEY = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const toValidDate = (value: DateValue): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatWith =
  (formatter: Intl.DateTimeFormat, fallback: string) =>
  (value: DateValue): string => {
    const date = toValidDate(value);
    return date ? formatter.format(date) : fallback;
  };

export const formatDate = formatWith(DATE, "-");
export const formatDateTime = formatWith(DATE_TIME, "-");
export const formatDayTime = formatWith(DAY_TIME, "-");
export const formatTime = formatWith(TIME, "-");
export const formatLongDate = formatWith(LONG_DATE, "");

export const businessDayKey = (value: DateValue): string => {
  const date = toValidDate(value);
  if (!date) return "";
  const parts = Object.fromEntries(
    DAY_KEY.formatToParts(date).map(({ type, value: part }) => [type, part]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const formatRelative = (date?: string | Date | null): string => {
  if (!date) return "";
  const d = dayjs(date);
  return d.isValid() ? d.locale("pt-br").fromNow() : "";
};
