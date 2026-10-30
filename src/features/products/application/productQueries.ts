import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductInput } from "../domain/product";
import { productsRepository } from "../data/productsRepository";

export const productKeys = {
  all: ["products"] as const,
};

const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
};

export const useCreateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (input: ProductInput) => productsRepository.create(input),
    onSuccess: invalidate,
  });
};

export const useUpdateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductInput }) =>
      productsRepository.update(id, input),
    onSuccess: invalidate,
  });
};
