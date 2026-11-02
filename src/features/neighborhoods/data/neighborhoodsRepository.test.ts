import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { neighborhoodsRepository } from "./neighborhoodsRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("neighborhoodsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list mapeia o nome da cidade e usa null quando ausente", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [
        { id: 1, name: "Centro", cityId: 10, city: { name: "Campinas" } },
        { id: 2, name: "Vila", cityId: 11 },
        { id: 3, name: "Jardim", cityId: 12, city: null },
      ],
    });

    const result = await neighborhoodsRepository.list();

    expect(httpClient.get).toHaveBeenCalledWith("/neighborhood", {
      params: undefined,
    });
    expect(result).toEqual([
      { id: 1, name: "Centro", cityId: 10, cityName: "Campinas" },
      { id: 2, name: "Vila", cityId: 11, cityName: null },
      { id: 3, name: "Jardim", cityId: 12, cityName: null },
    ]);
  });

  it("create, update e remove usam /neighborhood", async () => {
    const input = { name: "Centro", cityId: 10 };

    await neighborhoodsRepository.create(input);
    await neighborhoodsRepository.update(4, input);
    await neighborhoodsRepository.remove(4);

    expect(httpClient.post).toHaveBeenCalledWith("/neighborhood", input);
    expect(httpClient.put).toHaveBeenCalledWith("/neighborhood/4", input);
    expect(httpClient.delete).toHaveBeenCalledWith("/neighborhood/4");
  });
});
