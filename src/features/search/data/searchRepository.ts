import httpClient from "@/shared/api/httpClient";
import type { SearchResults } from "../domain/searchResults";

export const searchRepository = {
  async search(term: string): Promise<SearchResults> {
    const { data } = await httpClient.get<SearchResults>("/search", {
      params: { q: term },
    });
    return data;
  },
};
