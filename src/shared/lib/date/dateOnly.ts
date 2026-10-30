export const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

export const isoToDateOnly = (value: string): string => value.slice(0, 10);

export const dateOnlyToIso = (value: string): string =>
  new Date(value).toISOString();

export const formatUtcDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};
