import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultRankingFilters,
  hasRankingPeriod,
  rankingCsvFileName,
  toRankingCsv,
  type RankingFilters,
} from "./deliverymanRanking";

const filters = (overrides: Partial<RankingFilters> = {}): RankingFilters => ({
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  status: "all",
  pageSize: 10,
  ...overrides,
});

describe("defaultRankingFilters", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("usa os últimos 30 dias até hoje", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T12:00:00-03:00"));

    expect(defaultRankingFilters()).toEqual({
      startDate: "2026-02-13",
      endDate: "2026-03-15",
      status: "all",
      pageSize: 10,
    });
  });

  it("atravessa a virada de ano com zeros à esquerda", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T12:00:00-03:00"));

    const result = defaultRankingFilters();
    expect(result.startDate).toBe("2025-12-06");
    expect(result.endDate).toBe("2026-01-05");
  });
});

describe("hasRankingPeriod", () => {
  it("exige início e fim", () => {
    expect(hasRankingPeriod(filters())).toBe(true);
    expect(hasRankingPeriod(filters({ startDate: "" }))).toBe(false);
    expect(hasRankingPeriod(filters({ endDate: "" }))).toBe(false);
  });
});

describe("toRankingCsv", () => {
  it("gera cabeçalho e posições a partir de 1", () => {
    const csv = toRankingCsv([
      { deliverymanId: 1, deliverymanName: "Ana", totalDeliveries: 10 },
      { deliverymanId: 2, deliverymanName: "Bia", totalDeliveries: 7 },
    ]);

    expect(csv).toBe("posicao,entregador,total_entregas\n1,Ana,10\n2,Bia,7");
  });

  it("escapa nomes com vírgula e aspas", () => {
    const csv = toRankingCsv([
      { deliverymanId: 1, deliverymanName: 'Silva, "Zé"', totalDeliveries: 1 },
    ]);

    expect(csv.split("\n")[1]).toBe('1,"Silva, ""Zé""",1');
  });

  it("lista vazia gera só o cabeçalho", () => {
    expect(toRankingCsv([])).toBe("posicao,entregador,total_entregas");
  });
});

describe("rankingCsvFileName", () => {
  it("inclui o período no nome", () => {
    expect(rankingCsvFileName(filters())).toBe(
      "ranking-entregadores-2026-01-01-2026-01-31.csv",
    );
  });
});
