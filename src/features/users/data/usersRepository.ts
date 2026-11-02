import httpClient from "@/shared/api/httpClient";
import type { User, UserInput } from "../domain/user";

export const usersRepository = {
  async list(params: Record<string, string>): Promise<User[]> {
    const { data } = await httpClient.get<User[] | null>("/account", {
      params,
    });
    return Array.isArray(data) ? data : [];
  },

  async create(input: UserInput): Promise<void> {
    await httpClient.post("/account/staff", input);
  },

  async update(id: number, input: UserInput): Promise<void> {
    await httpClient.put(`/account/${id}`, input);
  },

  async setActive(id: number, active: boolean): Promise<void> {
    await httpClient.put(`/account/${id}`, { active });
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/account/${id}`);
  },
};
