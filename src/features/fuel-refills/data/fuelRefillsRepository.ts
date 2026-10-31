import type { DeliverymanRef, VehicleRef } from "@/features/fleet";
import { createCrudRepository } from "@/shared/api/createCrudRepository";
import type { FuelRefill, FuelRefillInput } from "../domain/fuelRefill";

interface FuelRefillDto {
  id: number;
  vehicleId: number;
  deliverymanId: number;
  km: number;
  previousKm?: number | null;
  kmDriven?: number | null;
  liters: number;
  pricePerLiter?: number | null;
  totalValue: number;
  refillDate: string;
  vehicle?: VehicleRef | null;
  deliveryman?: DeliverymanRef | null;
}

const toFuelRefill = (dto: FuelRefillDto): FuelRefill => ({
  id: dto.id,
  vehicleId: dto.vehicleId,
  deliverymanId: dto.deliverymanId,
  km: dto.km,
  previousKm: dto.previousKm ?? null,
  kmDriven: dto.kmDriven ?? null,
  liters: dto.liters,
  pricePerLiter: dto.pricePerLiter ?? null,
  totalValue: dto.totalValue,
  refillDate: dto.refillDate,
  vehicle: dto.vehicle ?? null,
  deliveryman: dto.deliveryman ?? null,
});

export const fuelRefillsRepository = createCrudRepository<
  FuelRefillDto,
  FuelRefill,
  FuelRefillInput
>("/fuel-refill", toFuelRefill);
