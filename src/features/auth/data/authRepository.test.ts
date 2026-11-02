import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { authRepository } from "./authRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { post: vi.fn() },
}));

describe("authRepository.login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("envia POST /login e devolve o resultado", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { accessToken: "tok", name: "Maria" },
    });

    const result = await authRepository.login("a@x.com", "123");

    expect(httpClient.post).toHaveBeenCalledWith("/login", {
      email: "a@x.com",
      password: "123",
    });
    expect(result).toEqual({ accessToken: "tok", name: "Maria" });
  });

  it("devolve objeto vazio quando não há corpo", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ data: null });
    expect(await authRepository.login("a", "b")).toEqual({});
  });

  it("propaga erro 401", async () => {
    const error = { response: { status: 401 } };
    vi.mocked(httpClient.post).mockRejectedValue(error);
    await expect(authRepository.login("a", "b")).rejects.toBe(error);
  });
});
