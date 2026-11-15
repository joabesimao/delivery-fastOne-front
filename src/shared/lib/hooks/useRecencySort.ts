import { useMemo, useState } from "react";
import {
  DEFAULT_SORT_ORDER,
  sortByRecency,
  type SortOrder,
} from "../sortOrder";

export const useRecencySort = <T extends { id: number }>(items: T[]) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
  const sorted = useMemo(
    () => sortByRecency(items, sortOrder),
    [items, sortOrder],
  );
  return { sorted, sortOrder, setSortOrder };
};
