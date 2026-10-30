import httpClient from "./httpClient";

export type QueryFilters = Record<string, string>;

export interface CrudRepository<TEntity, TInput> {
  list(filters?: QueryFilters): Promise<TEntity[]>;
  create(input: TInput): Promise<void>;
  update(id: number, input: TInput): Promise<void>;
  remove(id: number): Promise<void>;
}

export const createCrudRepository = <TDto, TEntity, TInput>(
  path: string,
  toEntity: (dto: TDto) => TEntity,
): CrudRepository<TEntity, TInput> => ({
  async list(filters) {
    const { data } = await httpClient.get<TDto[]>(path, { params: filters });
    return Array.isArray(data) ? data.map(toEntity) : [];
  },

  async create(input) {
    await httpClient.post(path, input);
  },

  async update(id, input) {
    await httpClient.put(`${path}/${id}`, input);
  },

  async remove(id) {
    await httpClient.delete(`${path}/${id}`);
  },
});
