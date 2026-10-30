export interface City {
  id: number;
  name: string;
}

export interface CityInput {
  name: string;
}

export interface CityFormValues {
  name: string;
}

export type CityFormErrors = Partial<Record<keyof CityFormValues, string>>;

export const emptyCityForm: CityFormValues = { name: "" };

export const toCityFormValues = (city: City): CityFormValues => ({
  name: city.name,
});

export const validateCityForm = (values: CityFormValues): CityFormErrors => {
  const errors: CityFormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome da cidade.";
  return errors;
};

export const toCityInput = (values: CityFormValues): CityInput => ({
  name: values.name.trim(),
});
