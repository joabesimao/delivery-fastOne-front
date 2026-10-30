export interface Neighborhood {
  id: number;
  name: string;
  cityId: number;
  cityName: string | null;
}

export interface NeighborhoodInput {
  name: string;
  cityId: number;
}

export interface NeighborhoodFormValues {
  name: string;
  cityId: string;
}

export type NeighborhoodFormErrors = Partial<
  Record<keyof NeighborhoodFormValues, string>
>;

export const emptyNeighborhoodForm: NeighborhoodFormValues = {
  name: "",
  cityId: "",
};

export const toNeighborhoodFormValues = (
  neighborhood: Neighborhood,
): NeighborhoodFormValues => ({
  name: neighborhood.name,
  cityId: String(neighborhood.cityId),
});

export const validateNeighborhoodForm = (
  values: NeighborhoodFormValues,
): NeighborhoodFormErrors => {
  const errors: NeighborhoodFormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome do bairro.";
  if (!values.cityId) errors.cityId = "Selecione a cidade.";
  return errors;
};

export const toNeighborhoodInput = (
  values: NeighborhoodFormValues,
): NeighborhoodInput => ({
  name: values.name.trim(),
  cityId: Number(values.cityId),
});
