import type { City } from "@/features/cities";
import type { Neighborhood } from "@/features/neighborhoods";
import {
  isValidCPF,
  isValidPhone,
  stripCPF,
  stripPhone,
} from "@/shared/lib/masks";

export interface AddressFormValues {
  street: string;
  neighborhood: string;
  numberHouse: string;
  reference: string;
  city: string;
}

export interface ClientRegistrationFormValues {
  name: string;
  cpf: string;
  phone: string;
  address: AddressFormValues;
}

export interface ClientRegistrationFormErrors {
  name?: string;
  cpf?: string;
  phone?: string;
  address?: Partial<Record<keyof AddressFormValues, string>>;
}

export interface ClientRegistrationInput {
  client: { name: string; cpf: string; phone: string };
  address: {
    street: string;
    neighborhood: string;
    numberHouse: number;
    reference: string;
    city: string;
  };
}

export interface RegisteredClient {
  id: number;
  clientData: ClientRegistrationFormValues;
}

export const emptyClientRegistrationForm: ClientRegistrationFormValues = {
  name: "",
  cpf: "",
  phone: "",
  address: {
    street: "",
    neighborhood: "",
    numberHouse: "",
    reference: "",
    city: "",
  },
};

export const validateClientRegistrationForm = (
  values: ClientRegistrationFormValues,
): ClientRegistrationFormErrors => {
  const errors: ClientRegistrationFormErrors = {};
  const addressErrors: ClientRegistrationFormErrors["address"] = {};

  if (!values.name.trim()) errors.name = "Informe o nome completo.";
  if (!values.cpf.trim()) errors.cpf = "Informe o CPF.";
  else if (!isValidCPF(values.cpf))
    errors.cpf =
      "CPF inválido. Use o formato XXX.XXX.XXX-XX ou apenas números.";
  if (!values.phone.trim()) errors.phone = "Informe o telefone.";
  else if (!isValidPhone(values.phone))
    errors.phone = "Telefone inválido. Use DDD + número.";
  if (!values.address.street.trim()) addressErrors.street = "Informe a rua.";
  if (!values.address.neighborhood.trim())
    addressErrors.neighborhood = "Informe o bairro.";
  if (!values.address.numberHouse.trim())
    addressErrors.numberHouse = "Informe o número.";
  if (!values.address.city.trim()) addressErrors.city = "Informe a cidade.";
  if (Object.keys(addressErrors).length) errors.address = addressErrors;

  return errors;
};

export const toClientRegistrationInput = (
  values: ClientRegistrationFormValues,
): ClientRegistrationInput => ({
  client: {
    name: values.name.trim(),
    cpf: stripCPF(values.cpf),
    phone: stripPhone(values.phone),
  },
  address: {
    street: values.address.street.trim(),
    neighborhood: values.address.neighborhood,
    numberHouse: Number(values.address.numberHouse),
    reference: values.address.reference.trim(),
    city: values.address.city,
  },
});

export const neighborhoodsOfCity = (
  cities: City[],
  neighborhoods: Neighborhood[],
  cityName: string,
): Neighborhood[] => {
  const city = cities.find((c) => c.name === cityName);
  return city
    ? neighborhoods.filter((n) => n.cityId === city.id)
    : neighborhoods;
};
