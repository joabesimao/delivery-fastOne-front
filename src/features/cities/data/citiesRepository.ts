import { createCrudRepository } from "@/shared/api/createCrudRepository";
import type { City, CityInput } from "../domain/city";

interface CityDto {
  id: number;
  name: string;
}

const toCity = (dto: CityDto): City => ({ id: dto.id, name: dto.name });

export const citiesRepository = createCrudRepository<CityDto, City, CityInput>(
  "/city",
  toCity,
);
