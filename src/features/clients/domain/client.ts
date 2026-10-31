import {
  cpfMask,
  isValidCPF,
  isValidPhone,
  phoneMask,
  stripCPF,
  stripPhone,
} from "@/shared/lib/masks";

export interface ClientAddress {
  id: number | null;
  street: string;
  neighborhood: string;
  numberHouse: string;
  reference: string;
  city: string;
}

export interface Client {
  id: number;
  name: string;
  cpf: string | null;
  phone: string;
  active: boolean;
  address: ClientAddress | null;
}

export type ClientStatusFilter = "all" | "active" | "inactive";

export interface ClientFilters {
  search: string;
  phone: string;
  city: string;
  status: ClientStatusFilter;
}

export interface ClientEditFormValues {
  name: string;
  cpf: string;
  phone: string;
  address: Omit<ClientAddress, "id">;
}

export interface ClientEditFormErrors {
  name?: string;
  cpf?: string;
  phone?: string;
  address?: Partial<Record<keyof ClientEditFormValues["address"], string>>;
}

export interface ClientUpdateInput {
  client: { name: string; cpf?: string; phone: string };
  address: {
    street: string;
    neighborhood: string;
    city: string;
    numberHouse: number;
    reference: string;
  };
}

export const ALL_CLIENTS = "all";

export const emptyClientFilters = (search = ""): ClientFilters => ({
  search,
  phone: "",
  city: ALL_CLIENTS,
  status: ALL_CLIENTS,
});

export const hasClientFilters = (filters: ClientFilters): boolean =>
  Boolean(filters.search || filters.phone) ||
  filters.city !== ALL_CLIENTS ||
  filters.status !== ALL_CLIENTS;

export const filterClients = (
  clients: Client[],
  filters: ClientFilters,
): Client[] => {
  const nameTerm = filters.search.trim().toLowerCase();
  const phoneTerm = filters.phone.trim().toLowerCase();

  return clients.filter((client) => {
    const address = client.address;
    const matchesName =
      !nameTerm ||
      client.name.toLowerCase().includes(nameTerm) ||
      Boolean(address?.neighborhood.toLowerCase().includes(nameTerm)) ||
      Boolean(address?.street.toLowerCase().includes(nameTerm));
    const matchesPhone =
      !phoneTerm || stripPhone(client.phone).includes(stripPhone(phoneTerm));
    const matchesCity =
      filters.city === ALL_CLIENTS || address?.city === filters.city;
    const matchesStatus =
      filters.status === ALL_CLIENTS ||
      (filters.status === "active") === client.active;

    return matchesName && matchesPhone && matchesCity && matchesStatus;
  });
};

export const citiesOfClients = (clients: Client[]): string[] =>
  Array.from(
    new Set(clients.map((c) => c.address?.city).filter(Boolean) as string[]),
  ).sort();

export const toClientEditFormValues = (
  client: Client,
): ClientEditFormValues => ({
  name: client.name,
  cpf: client.cpf ? cpfMask(client.cpf) : "",
  phone: phoneMask(client.phone),
  address: {
    street: client.address?.street ?? "",
    neighborhood: client.address?.neighborhood ?? "",
    numberHouse: client.address?.numberHouse ?? "",
    reference: client.address?.reference ?? "",
    city: client.address?.city ?? "",
  },
});

export const validateClientEditForm = (
  values: ClientEditFormValues,
): ClientEditFormErrors => {
  const errors: ClientEditFormErrors = {};
  const addressErrors: NonNullable<ClientEditFormErrors["address"]> = {};

  if (!values.name.trim()) errors.name = "Informe o nome.";
  if (values.cpf && !isValidCPF(values.cpf))
    errors.cpf =
      "CPF inválido. Use o formato XXX.XXX.XXX-XX ou apenas números.";
  if (!values.phone.trim()) errors.phone = "Informe o telefone.";
  else if (!isValidPhone(values.phone))
    errors.phone = "Telefone inválido. Use DDD + número.";
  if (!values.address.street.trim()) addressErrors.street = "Informe a rua.";
  if (!values.address.neighborhood.trim())
    addressErrors.neighborhood = "Informe o bairro.";
  if (!values.address.city.trim()) addressErrors.city = "Informe a cidade.";
  if (!values.address.numberHouse.trim())
    addressErrors.numberHouse = "Informe o número.";
  if (Object.keys(addressErrors).length) errors.address = addressErrors;

  return errors;
};

export const toClientUpdateInput = (
  values: ClientEditFormValues,
): ClientUpdateInput => ({
  client: {
    name: values.name,
    cpf: values.cpf ? stripCPF(values.cpf) : undefined,
    phone: stripPhone(values.phone),
  },
  address: {
    street: values.address.street,
    neighborhood: values.address.neighborhood,
    city: values.address.city,
    numberHouse: Number(values.address.numberHouse),
    reference: values.address.reference,
  },
});
