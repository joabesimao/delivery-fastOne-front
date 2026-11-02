import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ProductInput } from "../domain/product";
import {
  CATALOG_SAMPLE_LIMIT,
  type ProductListParams,
} from "../domain/productCatalog";
import { productsRepository } from "../data/productsRepository";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductListParams) =>
    [...productKeys.all, "list", params] as const,
};

const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
};

export const useProductPage = (params: ProductListParams) =>
  useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsRepository.list(params),
    placeholderData: keepPreviousData,
  });

export const useCatalogSample = () =>
  useProductPage({ limit: CATALOG_SAMPLE_LIMIT, offset: 0 });

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

export const useDeleteProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: number) => productsRepository.remove(id),
    onSuccess: invalidate,
  });
};
