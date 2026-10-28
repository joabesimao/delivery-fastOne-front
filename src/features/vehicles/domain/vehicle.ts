export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  brand: string | null;
  deliverymanId: number | null;
}

export interface VehicleInput {
  plate: string;
  model: string;
  brand?: string;
  deliverymanId?: number;
}

export interface VehicleFormValues {
  plate: string;
  model: string;
  brand: string;
  deliverymanId: string;
}

export type VehicleFormErrors = Partial<Record<"plate" | "model", string>>;

export const emptyVehicleForm: VehicleFormValues = {
  plate: "",
  model: "",
  brand: "",
  deliverymanId: "",
};

export const toVehicleFormValues = (vehicle: Vehicle): VehicleFormValues => ({
  plate: vehicle.plate,
  model: vehicle.model,
  brand: vehicle.brand ?? "",
  deliverymanId: vehicle.deliverymanId ? String(vehicle.deliverymanId) : "",
});

export const validateVehicleForm = (
  values: VehicleFormValues,
): VehicleFormErrors => {
  const errors: VehicleFormErrors = {};
  if (!values.plate.trim()) errors.plate = "Informe a placa do veículo.";
  if (!values.model.trim()) errors.model = "Informe o modelo do veículo.";
  return errors;
};

export const toVehicleInput = (values: VehicleFormValues): VehicleInput => ({
  plate: values.plate.trim().toUpperCase(),
  model: values.model.trim(),
  brand: values.brand.trim() || undefined,
  deliverymanId: values.deliverymanId
    ? Number(values.deliverymanId)
    : undefined,
});
