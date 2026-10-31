import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/lib/hooks/useDebouncedValue";
import { isSearchable } from "../domain/searchResults";
import { searchRepository } from "../data/searchRepository";

const SEARCH_DEBOUNCE_MS = 300;

export const searchKeys = {
  all: ["global-search"] as const,
  term: (term: string) => [...searchKeys.all, term] as const,
};

export const useGlobalSearch = (term: string) => {
  const debounced = useDebouncedValue(term.trim(), SEARCH_DEBOUNCE_MS);
  const query = useQuery({
    queryKey: searchKeys.term(debounced),
    queryFn: () => searchRepository.search(debounced).catch(() => null),
    enabled: isSearchable(debounced),
    gcTime: 0,
  });
  return { results: query.data ?? null, loading: query.isFetching };
};
