import httpClient from "@/shared/api/httpClient";
import type { LoginResult } from "../domain/credentials";

export const authRepository = {
  async login(email: string, password: string): Promise<LoginResult> {
    const { data } = await httpClient.post<LoginResult>("/login", {
      email,
      password,
    });
    return data ?? {};
  },
};
