import { escapeCsvValue } from "@/shared/lib/downloadFile";

export type RankingStatusFilter = "all" | "delivered" | "finished";

export interface RankingFilters {
  startDate: string;
  endDate: string;
  status: RankingStatusFilter;
  pageSize: number;
}

export interface RankingQuery extends RankingFilters {
  page: number;
}

export interface RankingItem {
  deliverymanId: number;
  deliverymanName: string;
  totalDeliveries: number;
}

export interface RankingPage {
  items: RankingItem[];
  page: number;
  totalItems: number;
  totalPages: number;
  totalDeliveries: number;
}

export const RANKING_STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "delivered", label: "Entregues" },
  { value: "finished", label: "Finalizadas" },
];

export const RANKING_PAGE_SIZE_OPTIONS = ["5", "10", "20", "50"].map(
  (value) => ({ value, label: value }),
);

export const RANKING_EXPORT_PAGE_SIZE = 100;

const RANKING_DEFAULT_PERIOD_DAYS = 30;

const toLocalIsoDate = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const defaultRankingFilters = (): RankingFilters => {
  const start = new Date();
  start.setDate(start.getDate() - RANKING_DEFAULT_PERIOD_DAYS);
  return {
    startDate: toLocalIsoDate(start),
    endDate: toLocalIsoDate(new Date()),
    status: "all",
    pageSize: 10,
  };
};

export const hasRankingPeriod = (filters: RankingFilters): boolean =>
  Boolean(filters.startDate && filters.endDate);

export const toRankingCsv = (items: RankingItem[]): string =>
  [
    "posicao,entregador,total_entregas",
    ...items.map((item, index) =>
      [index + 1, item.deliverymanName, item.totalDeliveries]
        .map(escapeCsvValue)
        .join(","),
    ),
  ].join("\n");

export const rankingCsvFileName = ({ startDate, endDate }: RankingFilters) =>
  `ranking-entregadores-${startDate}-${endDate}.csv`;
