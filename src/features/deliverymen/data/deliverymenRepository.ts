import { createCrudRepository } from "@/shared/api/createCrudRepository";
import type { Deliveryman, DeliverymanInput } from "../domain/deliveryman";

interface DeliverymanDto {
  id: number;
  name: string;
  lastName: string;
  phone?: string | null;
  cpf?: string | null;
  numberQualification?: string | null;
}

const toDeliveryman = (dto: DeliverymanDto): Deliveryman => ({
  id: dto.id,
  name: dto.name,
  lastName: dto.lastName,
  phone: dto.phone ?? "",
  cpf: dto.cpf || null,
  numberQualification: dto.numberQualification ?? "",
});

export const deliverymenRepository = createCrudRepository<
  DeliverymanDto,
  Deliveryman,
  DeliverymanInput
>("/deliveryman", toDeliveryman);
