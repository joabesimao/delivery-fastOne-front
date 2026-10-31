import httpClient from "@/shared/api/httpClient";
import type { Client, ClientUpdateInput } from "../domain/client";

interface ClientDto {
  id: number;
  name: string;
  cpf?: string | null;
  phone: string;
  status?: boolean;
  Register?: {
    addressId?: number;
    address?: {
      id?: number;
      street?: string;
      neighborhood?: string;
      numberHouse?: number | string;
      reference?: string | null;
      city?: string;
    } | null;
  } | null;
}

const toClient = (dto: ClientDto): Client => {
  const address = dto.Register?.address;
  return {
    id: dto.id,
    name: dto.name,
    cpf: dto.cpf || null,
    phone: dto.phone,
    active: dto.status !== false,
    address: address
      ? {
          id: dto.Register?.addressId ?? address.id ?? null,
          street: address.street ?? "",
          neighborhood: address.neighborhood ?? "",
          numberHouse: address.numberHouse ? String(address.numberHouse) : "",
          reference: address.reference ?? "",
          city: address.city ?? "",
        }
      : null,
  };
};

export const clientsListRepository = {
  async list(): Promise<Client[]> {
    const { data } = await httpClient.get<ClientDto[] | null>("/client");
    return Array.isArray(data) ? data.map(toClient) : [];
  },

  async update(
    clientId: number,
    addressId: number,
    input: ClientUpdateInput,
  ): Promise<void> {
    await httpClient.put(`/client/${clientId}`, input.client);
    await httpClient.put(`/address/${addressId}`, input.address);
  },

  async setActive(clientId: number, active: boolean): Promise<void> {
    await httpClient.put(`/client/${clientId}`, { status: active });
  },
};
