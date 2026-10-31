import httpClient from "@/shared/api/httpClient";
import type { ClientRegister } from "../domain/clientRegister";
import type { ClientRegistrationInput } from "../domain/clientRegistration";

interface RegisterDto {
  id: number;
  client: { name: string; phone: string };
  address: {
    street: string;
    neighborhood: string;
    numberHouse: number | string;
    reference?: string | null;
    city: string;
  };
}

type PartialRegisterDto = Partial<RegisterDto> | null;

const isCompleteRegister = (dto: PartialRegisterDto): dto is RegisterDto =>
  Boolean(dto?.client && dto.address);

const toClientRegister = ({
  id,
  client,
  address,
}: RegisterDto): ClientRegister => ({
  id,
  name: client.name,
  phone: client.phone,
  address: {
    street: address.street,
    neighborhood: address.neighborhood,
    numberHouse: String(address.numberHouse),
    reference: address.reference ?? "",
    city: address.city,
  },
});

export const clientsRepository = {
  async register(input: ClientRegistrationInput): Promise<{ id: number }> {
    const { data } = await httpClient.post<{ id: number }>("/register", input);
    return { id: data.id };
  },

  async listRegisters(): Promise<ClientRegister[]> {
    const { data } = await httpClient.get<PartialRegisterDto[]>("/register");
    return Array.isArray(data)
      ? data.filter(isCompleteRegister).map(toClientRegister)
      : [];
  },
};
