import { createCrudRepository } from "@/shared/api/createCrudRepository";
import type { Neighborhood, NeighborhoodInput } from "../domain/neighborhood";

interface NeighborhoodDto {
  id: number;
  name: string;
  cityId: number;
  city?: { name: string } | null;
}

const toNeighborhood = (dto: NeighborhoodDto): Neighborhood => ({
  id: dto.id,
  name: dto.name,
  cityId: dto.cityId,
  cityName: dto.city?.name ?? null,
});

export const neighborhoodsRepository = createCrudRepository<
  NeighborhoodDto,
  Neighborhood,
  NeighborhoodInput
>("/neighborhood", toNeighborhood);
