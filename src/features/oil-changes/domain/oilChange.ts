import type { FleetRecord } from "@/features/fleet";
import {
  dateOnlyToIso,
  isoToDateOnly,
  todayIsoDate,
} from "@/shared/lib/date/dateOnly";

export interface OilChange extends FleetRecord {
  id: number;
  km: number;
  nextChangeKm: number;
  changeDate: string;
}

export interface OilChangeInput {
  vehicleId: number;
  deliverymanId: number;
  km: number;
  changeDate: string;
}

export interface OilChangeFormValues {
  vehicleId: string;
  deliverymanId: string;
  km: string;
  changeDate: string;
}

export type OilChangeFormErrors = Partial<
  Record<keyof OilChangeFormValues, string>
>;

export const emptyOilChangeForm = (): OilChangeFormValues => ({
  vehicleId: "",
  deliverymanId: "",
  km: "",
  changeDate: todayIsoDate(),
});

export const toOilChangeFormValues = (
  oilChange: OilChange,
): OilChangeFormValues => ({
  vehicleId: String(oilChange.vehicleId),
  deliverymanId: String(oilChange.deliverymanId),
  km: String(oilChange.km),
  changeDate: isoToDateOnly(oilChange.changeDate),
});

export const validateOilChangeForm = (
  values: OilChangeFormValues,
): OilChangeFormErrors => {
  const errors: OilChangeFormErrors = {};
  if (!values.vehicleId) errors.vehicleId = "Selecione o veículo.";
  if (!values.deliverymanId) errors.deliverymanId = "Selecione o entregador.";
  if (!values.km || Number(values.km) <= 0) errors.km = "Informe o km lançado.";
  if (!values.changeDate) errors.changeDate = "Informe a data da troca.";
  return errors;
};

export const toOilChangeInput = (
  values: OilChangeFormValues,
): OilChangeInput => ({
  vehicleId: Number(values.vehicleId),
  deliverymanId: Number(values.deliverymanId),
  km: Number(values.km),
  changeDate: dateOnlyToIso(values.changeDate),
});

export const oilChangeInterval = (oilChange: OilChange): number =>
  oilChange.nextChangeKm - oilChange.km;

export const previewNextChangeKm = (
  km: string,
  interval: number,
): number | null => (Number(km) > 0 ? Number(km) + interval : null);
