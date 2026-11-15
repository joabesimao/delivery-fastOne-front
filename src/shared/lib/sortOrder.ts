export type SortOrder = "recent" | "oldest";

export const DEFAULT_SORT_ORDER: SortOrder = "recent";

export const SORT_ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
];

export const sortByRecency = <T extends { id: number }>(
  items: readonly T[],
  order: SortOrder,
): T[] =>
  [...items].sort((a, b) => (order === "recent" ? b.id - a.id : a.id - b.id));
