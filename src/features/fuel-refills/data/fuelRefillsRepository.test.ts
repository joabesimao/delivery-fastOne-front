import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { fuelRefillsRepository } from "./fuelRefillsRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const baseDto = {
  id: 1,
  vehicleId: 2,
  deliverymanId: 3,
  km: 12500,
  liters: 40,
  totalValue: 220,
  refillDate: "2025-03-10T00:00:00.000Z",
};

describe("fuelRefillsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list normaliza campos opcionais ausentes para null", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: [baseDto] });

    const result = await fuelRefillsRepository.list();

    expect(httpClient.get).toHaveBeenCalledWith("/fuel-refill", {
      params: undefined,
    });
    expect(result).toEqual([
      {
        ...baseDto,
        previousKm: null,
        kmDriven: null,
        pricePerLiter: null,
        vehicle: null,
        deliveryman: null,
      },
    ]);
  });

  it("list preserva valores informados, inclusive zero", async () => {
    const vehicle = { id: 2, plate: "ABC1D23" };
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [
        {
          ...baseDto,
          previousKm: 12000,
          kmDriven: 0,
          pricePerLiter: 0,
          vehicle,
          deliveryman: null,
        },
      ],
    });

    const [item] = await fuelRefillsRepository.list();

    expect(item).toMatchObject({
      previousKm: 12000,
      kmDriven: 0,
      pricePerLiter: 0,
      vehicle,
      deliveryman: null,
    });
  });

  it("create, update e remove usam /fuel-refill", async () => {
    const input = {
      vehicleId: 2,
      deliverymanId: 3,
      km: 1,
      liters: 1,
      pricePerLiter: 1,
      totalValue: 1,
      refillDate: "2025-03-10T00:00:00.000Z",
    };

    await fuelRefillsRepository.create(input);
    await fuelRefillsRepository.update(4, input);
    await fuelRefillsRepository.remove(4);

    expect(httpClient.post).toHaveBeenCalledWith("/fuel-refill", input);
    expect(httpClient.put).toHaveBeenCalledWith("/fuel-refill/4", input);
    expect(httpClient.delete).toHaveBeenCalledWith("/fuel-refill/4");
  });
});
