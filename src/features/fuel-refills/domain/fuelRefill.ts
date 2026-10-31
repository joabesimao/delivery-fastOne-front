import type { FleetRecord } from "@/features/fleet";
import {
  dateOnlyToIso,
  isoToDateOnly,
  todayIsoDate,
} from "@/shared/lib/date/dateOnly";

export interface FuelRefill extends FleetRecord {
  id: number;
  km: number;
  previousKm: number | null;
  kmDriven: number | null;
  liters: number;
  pricePerLiter: number | null;
  totalValue: number;
  refillDate: string;
}

export interface FuelRefillInput {
  vehicleId: number;
  deliverymanId: number;
  km: number;
  liters: number;
  pricePerLiter: number;
  totalValue: number;
  refillDate: string;
}

export interface FuelRefillFormValues {
  vehicleId: string;
  deliverymanId: string;
  km: string;
  liters: string;
  pricePerLiter: string;
  totalValue: string;
  refillDate: string;
}

export type FuelRefillFormErrors = Partial<
  Record<keyof FuelRefillFormValues, string>
>;

export const computeTotalValue = (
  liters: string,
  pricePerLiter: string,
): string => {
  const total = Number(liters) * Number(pricePerLiter);
  return liters && pricePerLiter && Number.isFinite(total) && total > 0
    ? total.toFixed(2)
    : "";
};

export const fuelConsumption = (refill: FuelRefill): string => {
  if (refill.kmDriven === null || !refill.liters) return "—";
  return `${(refill.kmDriven / refill.liters).toFixed(2)} km/l`;
};

export const emptyFuelRefillForm = (): FuelRefillFormValues => ({
  vehicleId: "",
  deliverymanId: "",
  km: "",
  liters: "",
  pricePerLiter: "",
  totalValue: "",
  refillDate: todayIsoDate(),
});

export const toFuelRefillFormValues = (
  refill: FuelRefill,
): FuelRefillFormValues => ({
  vehicleId: String(refill.vehicleId),
  deliverymanId: String(refill.deliverymanId),
  km: String(refill.km),
  liters: String(refill.liters),
  pricePerLiter:
    refill.pricePerLiter === null ? "" : String(refill.pricePerLiter),
  totalValue: String(refill.totalValue),
  refillDate: isoToDateOnly(refill.refillDate),
});

export const validateFuelRefillForm = (
  values: FuelRefillFormValues,
): FuelRefillFormErrors => {
  const errors: FuelRefillFormErrors = {};
  if (!values.vehicleId) errors.vehicleId = "Selecione o veículo.";
  if (!values.deliverymanId) errors.deliverymanId = "Selecione o entregador.";
  if (!values.km || Number(values.km) <= 0)
    errors.km = "Informe o km do abastecimento.";
  if (!values.liters || Number(values.liters) <= 0)
    errors.liters = "Informe os litros abastecidos.";
  if (!values.pricePerLiter || Number(values.pricePerLiter) <= 0)
    errors.pricePerLiter = "Informe o preço do litro.";
  if (!values.totalValue || Number(values.totalValue) <= 0)
    errors.totalValue = "Informe o valor pago.";
  if (!values.refillDate)
    errors.refillDate = "Informe a data do abastecimento.";
  return errors;
};

export const toFuelRefillInput = (
  values: FuelRefillFormValues,
): FuelRefillInput => ({
  vehicleId: Number(values.vehicleId),
  deliverymanId: Number(values.deliverymanId),
  km: Number(values.km),
  liters: Number(values.liters),
  pricePerLiter: Number(values.pricePerLiter),
  totalValue: Number(values.totalValue),
  refillDate: dateOnlyToIso(values.refillDate),
});
