export const computeTotalValue = (liters: string, pricePerLiter: string): string => {
  const total = Number(liters) * Number(pricePerLiter);
  return liters && pricePerLiter && Number.isFinite(total) && total > 0 ? total.toFixed(2) : "";
};
