import httpClient from "@/shared/api/httpClient";
import type { Vehicle, VehicleInput } from "../domain/vehicle";

interface VehicleDto {
  id: number;
  plate: string;
  model: string;
  brand?: string | null;
  deliverymanId?: number | null;
}

const toVehicle = (dto: VehicleDto): Vehicle => ({
  id: dto.id,
  plate: dto.plate,
  model: dto.model,
  brand: dto.brand || null,
  deliverymanId: dto.deliverymanId ?? null,
});

export const vehiclesRepository = {
  async list(): Promise<Vehicle[]> {
    const { data } = await httpClient.get<VehicleDto[]>("/vehicle");
    return Array.isArray(data) ? data.map(toVehicle) : [];
  },

  async create(input: VehicleInput): Promise<void> {
    await httpClient.post("/vehicle", input);
  },

  async update(id: number, input: VehicleInput): Promise<void> {
    await httpClient.put(`/vehicle/${id}`, input);
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/vehicle/${id}`);
  },
};
