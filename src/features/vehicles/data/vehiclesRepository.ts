import { createCrudRepository } from "@/shared/api/createCrudRepository";
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

export const vehiclesRepository = createCrudRepository<
  VehicleDto,
  Vehicle,
  VehicleInput
>("/vehicle", toVehicle);
