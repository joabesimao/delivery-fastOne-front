import type { DeliverymanRef, VehicleRef } from "@/features/fleet";
import { createCrudRepository } from "@/shared/api/createCrudRepository";
import type { OilChange, OilChangeInput } from "../domain/oilChange";

interface OilChangeDto {
  id: number;
  vehicleId: number;
  deliverymanId: number;
  km: number;
  nextChangeKm: number;
  changeDate: string;
  vehicle?: VehicleRef | null;
  deliveryman?: DeliverymanRef | null;
}

const toOilChange = (dto: OilChangeDto): OilChange => ({
  id: dto.id,
  vehicleId: dto.vehicleId,
  deliverymanId: dto.deliverymanId,
  km: dto.km,
  nextChangeKm: dto.nextChangeKm,
  changeDate: dto.changeDate,
  vehicle: dto.vehicle ?? null,
  deliveryman: dto.deliveryman ?? null,
});

export const oilChangesRepository = createCrudRepository<
  OilChangeDto,
  OilChange,
  OilChangeInput
>("/oil-change-log", toOilChange);
