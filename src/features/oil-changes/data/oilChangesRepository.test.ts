import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { oilChangesRepository } from "./oilChangesRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const dto = {
  id: 1,
  vehicleId: 2,
  deliverymanId: 3,
  km: 10000,
  nextChangeKm: 15000,
  changeDate: "2025-03-10T00:00:00.000Z",
};

describe("oilChangesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list normaliza vehicle e deliveryman ausentes para null", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: [dto] });

    const result = await oilChangesRepository.list();

    expect(httpClient.get).toHaveBeenCalledWith("/oil-change-log", {
      params: undefined,
    });
    expect(result).toEqual([{ ...dto, vehicle: null, deliveryman: null }]);
  });

  it("list preserva vehicle e deliveryman informados", async () => {
    const vehicle = { id: 2, plate: "ABC1D23" };
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [{ ...dto, vehicle, deliveryman: null }],
    });

    const [item] = await oilChangesRepository.list();

    expect(item.vehicle).toEqual(vehicle);
    expect(item.deliveryman).toBeNull();
  });

  it("create, update e remove usam /oil-change-log", async () => {
    const input = {
      vehicleId: 2,
      deliverymanId: 3,
      km: 1,
      changeDate: "2025-03-10T00:00:00.000Z",
    };

    await oilChangesRepository.create(input);
    await oilChangesRepository.update(4, input);
    await oilChangesRepository.remove(4);

    expect(httpClient.post).toHaveBeenCalledWith("/oil-change-log", input);
    expect(httpClient.put).toHaveBeenCalledWith("/oil-change-log/4", input);
    expect(httpClient.delete).toHaveBeenCalledWith("/oil-change-log/4");
  });
});
