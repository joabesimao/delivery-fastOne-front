import { useState } from "react";
import { useLocation } from "react-router-dom";

const searchOf = (state: unknown): string | null => {
  const search = (state as { search?: unknown } | null)?.search;
  return typeof search === "string" ? search : null;
};

export const useFiltersFromNavigation = <TFilters>(
  toFilters: (search: string) => TFilters,
) => {
  const location = useLocation();
  const [filters, setFilters] = useState(() =>
    toFilters(searchOf(location.state) ?? ""),
  );
  const [appliedKey, setAppliedKey] = useState(location.key);

  if (location.key !== appliedKey) {
    setAppliedKey(location.key);
    const search = searchOf(location.state);
    if (search !== null) setFilters(toFilters(search));
  }

  return [filters, setFilters] as const;
};
