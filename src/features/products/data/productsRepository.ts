import httpClient from "@/shared/api/httpClient";
import type { Product, ProductInput } from "../domain/product";
import type { ProductListParams, ProductPage } from "../domain/productCatalog";

interface ProductPageDto {
  items?: Product[];
  pagination?: { total?: number };
}

export const productsRepository = {
  async list(params: ProductListParams): Promise<ProductPage> {
    const { data } = await httpClient.get<ProductPageDto>("/product", {
      params,
    });
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      total: data?.pagination?.total ?? 0,
    };
  },

  async create(input: ProductInput): Promise<Product> {
    const { data } = await httpClient.post<Product>("/product", input);
    return data;
  },

  async update(id: number, input: ProductInput): Promise<Product> {
    const { data } = await httpClient.put<Product>(`/product/${id}`, input);
    return data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/product/${id}`);
  },
};
