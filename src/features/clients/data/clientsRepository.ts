import httpClient from "@/shared/api/httpClient";
import type { ClientRegistrationInput } from "../domain/clientRegistration";

export const clientsRepository = {
  async register(input: ClientRegistrationInput): Promise<{ id: number }> {
    const { data } = await httpClient.post<{ id: number }>("/register", input);
    return { id: data.id };
  },
};
