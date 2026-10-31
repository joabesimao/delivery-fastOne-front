import httpClient from "@/shared/api/httpClient";
import type { UserInput } from "../domain/user";

export const usersRepository = {
  async create(input: UserInput): Promise<void> {
    await httpClient.post("/account/staff", input);
  },

  async update(id: number, input: UserInput): Promise<void> {
    await httpClient.put(`/account/${id}`, input);
  },
};
