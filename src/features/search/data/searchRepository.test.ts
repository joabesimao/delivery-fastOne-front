import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { searchRepository } from "./searchRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn() },
}));

describe("searchRepository.search", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("busca /search com o termo em q", async () => {
    const data = { orders: [], clients: [], deliverymen: [] };
    vi.mocked(httpClient.get).mockResolvedValue({ data });

    const result = await searchRepository.search("maria");

    expect(httpClient.get).toHaveBeenCalledWith("/search", {
      params: { q: "maria" },
    });
    expect(result).toBe(data);
  });

  it("propaga erro", async () => {
    vi.mocked(httpClient.get).mockRejectedValue(new Error("falhou"));
    await expect(searchRepository.search("x")).rejects.toThrow("falhou");
  });
});
