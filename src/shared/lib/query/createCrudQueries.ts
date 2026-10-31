import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CrudRepository,
  QueryFilters,
} from "@/shared/api/createCrudRepository";

interface PendingMutation<TVariables> {
  isPending: boolean;
  variables?: TVariables;
}

export const createCrudQueries = <TEntity, TInput>(
  scope: string,
  repository: CrudRepository<TEntity, TInput>,
) => {
  const keys = {
    all: [scope] as const,
    list: (filters?: QueryFilters) =>
      filters
        ? ([scope, "list", filters] as const)
        : ([scope, "list"] as const),
  };

  const useInvalidate = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: keys.all });
  };

  const useList = (filters?: QueryFilters) =>
    useQuery({
      queryKey: keys.list(filters),
      queryFn: () => repository.list(filters),
    });

  const useCreate = () => {
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: (input: TInput) => repository.create(input),
      onSuccess: invalidate,
    });
  };

  const useUpdate = () => {
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: ({ id, input }: { id: number; input: TInput }) =>
        repository.update(id, input),
      onSuccess: invalidate,
    });
  };

  const useRemove = () => {
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: (id: number) => repository.remove(id),
      onSuccess: invalidate,
    });
  };

  return { keys, useList, useCreate, useUpdate, useRemove };
};

export const getBusyRowId = (
  update: PendingMutation<{ id: number }>,
  remove: PendingMutation<number>,
): number | null =>
  (update.isPending && update.variables?.id) ||
  (remove.isPending && remove.variables) ||
  null;
