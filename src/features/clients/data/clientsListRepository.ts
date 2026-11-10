import httpClient from "@/shared/api/httpClient";
import type { Client, ClientUpdateInput } from "../domain/client";

interface ClientDto {
  id: number;
  name: string;
  cpf?: string | null;
  phone: string;
  status?: boolean;
  Register?: {
    id?: number;
    address?: {
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
    registerId: dto.Register?.id ?? null,
    address: address
      ? {
          street: address.street ?? "",
          neighborhood: address.neighborhood ?? "",
          numberHouse:
            address.numberHouse != null ? String(address.numberHouse) : "",
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

  async update(registerId: number, input: ClientUpdateInput): Promise<void> {
    await httpClient.put(`/register/${registerId}`, input);
  },

  async setActive(clientId: number, active: boolean): Promise<void> {
    await httpClient.put(`/client/${clientId}`, { status: active });
  },
};
