import { MANAGER_ROLES } from "@/shared/session/roles";

export const FLEET_MANAGER_ROLES = MANAGER_ROLES;

export interface VehicleRef {
  plate: string;
  model: string;
}

export interface DeliverymanRef {
  name: string;
  lastName: string;
}

export interface FleetRecord {
  vehicleId: number;
  deliverymanId: number;
  vehicle: VehicleRef | null;
  deliveryman: DeliverymanRef | null;
}

export interface FleetFilterValues {
  vehicleId: string;
  deliverymanId: string;
}
