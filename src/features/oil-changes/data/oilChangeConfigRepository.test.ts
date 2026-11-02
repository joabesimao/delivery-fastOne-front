import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { oilChangeConfigRepository } from "./oilChangeConfigRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("oilChangeConfigRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("get retorna a configuração", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: { intervalKm: 5000 } });

    await expect(oilChangeConfigRepository.get()).resolves.toEqual({
      intervalKm: 5000,
    });
    expect(httpClient.get).toHaveBeenCalledWith("/oil-change-config");
  });

  it("get retorna null quando não há configuração", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: undefined });

    await expect(oilChangeConfigRepository.get()).resolves.toBeNull();
  });

  it("save faz PUT da configuração", async () => {
    await oilChangeConfigRepository.save({ intervalKm: 6000 });

    expect(httpClient.put).toHaveBeenCalledWith("/oil-change-config", {
      intervalKm: 6000,
    });
  });
});
