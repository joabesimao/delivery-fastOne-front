import {
  formatCurrencyFromNumber,
  parseCurrencyToNumber,
} from "@/shared/lib/masks";
import type { Product } from "./product";

export type ProductViewMode = "cards" | "tabela";
export type StockFilter = "all" | "in" | "low";
export type ProductSortOption = "recent" | "name" | "priceAsc" | "priceDesc";

export const ALL_CATEGORIES = "all";
export const CATALOG_SAMPLE_LIMIT = 100;

export interface ProductFilters {
  name: string;
  category: string;
  priceMin: string;
  priceMax: string;
}

export interface ProductPageQuery extends ProductFilters {
  page: number;
  rowsPerPage: number;
}

export type ProductListParams = Record<string, string | number>;

export interface ProductPage {
  items: Product[];
  total: number;
}

export interface StockInfo {
  status: Exclude<StockFilter, "all">;
  label: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export const ROWS_PER_PAGE_BY_VIEW: Record<ProductViewMode, number> = {
  cards: 9,
  tabela: 10,
};

export const ROWS_PER_PAGE_OPTIONS_BY_VIEW: Record<ProductViewMode, number[]> =
  {
    cards: [9, 18, 30],
    tabela: [10, 25, 50],
  };

export const STOCK_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "in", label: "Em Estoque" },
  { value: "low", label: "Baixo Estoque" },
];

export const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "recent", label: "Mais Recentes" },
  { value: "name", label: "Nome (A-Z)" },
  { value: "priceAsc", label: "Menor Preço" },
  { value: "priceDesc", label: "Maior Preço" },
];

export const stockInfoOf = (product: Pick<Product, "id">): StockInfo => {
  if (product.id % 5 === 0) {
    return { status: "low", label: `Apenas ${(product.id % 3) + 1} un` };
  }
  return { status: "in", label: "Em Estoque" };
};

const toPrice = (value: string): number | null => {
  if (!value) return null;
  const parsed = parseCurrencyToNumber(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const toProductListParams = ({
  name,
  category,
  priceMin,
  priceMax,
  page,
  rowsPerPage,
}: ProductPageQuery): ProductListParams => {
  const params: ProductListParams = {
    limit: rowsPerPage,
    offset: page * rowsPerPage,
  };
  if (name) params.name = name;
  if (category !== ALL_CATEGORIES) params.category = category;
  const min = toPrice(priceMin);
  if (min !== null) params.priceMin = min;
  const max = toPrice(priceMax);
  if (max !== null) params.priceMax = max;
  return params;
};

const SORTERS: Record<ProductSortOption, (a: Product, b: Product) => number> = {
  recent: (a, b) => b.id - a.id,
  name: (a, b) => a.name.localeCompare(b.name),
  priceAsc: (a, b) => Number(a.price) - Number(b.price),
  priceDesc: (a, b) => Number(b.price) - Number(a.price),
};

export const visibleProducts = (
  products: Product[],
  stock: StockFilter,
  sort: ProductSortOption,
): Product[] =>
  products
    .filter((p) => stock === "all" || stockInfoOf(p).status === stock)
    .sort(SORTERS[sort]);

export const summarizeCatalog = (sample: Product[]) => ({
  categories: Array.from(
    sample.reduce(
      (counts, item) =>
        counts.set(item.category, (counts.get(item.category) ?? 0) + 1),
      new Map<string, number>(),
    ),
    ([category, count]): CategoryCount => ({ category, count }),
  ).sort((a, b) => b.count - a.count),
  averagePrice:
    sample.length === 0
      ? 0
      : sample.reduce((sum, item) => sum + Number(item.price), 0) /
        sample.length,
  lowStockCount: sample.filter((item) => stockInfoOf(item).status === "low")
    .length,
});

const quoted = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const toCatalogCsv = (products: Product[]): string =>
  [
    [
      "ID",
      "Nome",
      "Categoria",
      "Marca",
      "Código de barras",
      "Preço",
      "Status",
      "Descrição",
    ],
    ...products.map((p) => [
      p.id,
      quoted(p.name),
      quoted(p.category),
      quoted(p.brand ?? ""),
      quoted(p.barcode ?? ""),
      formatCurrencyFromNumber(Number(p.price)),
      p.status ? "Ativo" : "Inativo",
      quoted(p.description),
    ]),
  ]
    .map((row) => row.join(";"))
    .join("\n");

export const catalogCsvFileName = (page: number) =>
  `cardapio-pagina-${page + 1}.csv`;
