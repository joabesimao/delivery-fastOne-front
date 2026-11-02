export interface OilChangeConfig {
  intervalKm: number;
}

export const parseIntervalKm = (value: string): number | null => {
  const parsed = Number(value);
  return !value || Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
};
