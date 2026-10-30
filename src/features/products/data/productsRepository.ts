import httpClient from "@/shared/api/httpClient";
import type { Product, ProductInput } from "../domain/product";

export const productsRepository = {
  async create(input: ProductInput): Promise<Product> {
    const { data } = await httpClient.post<Product>("/product", input);
    return data;
  },

  async update(id: number, input: ProductInput): Promise<Product> {
    const { data } = await httpClient.put<Product>(`/product/${id}`, input);
    return data;
  },
};
