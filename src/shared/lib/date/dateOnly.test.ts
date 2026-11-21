import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatDateOnly,
  formatUtcDate,
  isoToDateOnly,
  shiftDateOnly,
  todayIsoDate,
} from "./dateOnly";

describe("dateOnly", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("todayIsoDate retorna a data local atual", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:34:56Z"));

    expect(todayIsoDate()).toBe("2025-06-15");
  });

  it("todayIsoDate não avança o dia à noite no horário local", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 23, 30));

    expect(todayIsoDate()).toBe("2025-06-15");
  });

  it("todayIsoDate não volta o dia logo após a meia-noite local", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 1, 0, 5));

    expect(todayIsoDate()).toBe("2025-01-01");
  });

  it("isoToDateOnly corta a parte de hora", () => {
    expect(isoToDateOnly("2025-03-10T00:00:00.000Z")).toBe("2025-03-10");
    expect(isoToDateOnly("2025-03-10")).toBe("2025-03-10");
  });

  it("todayIsoDate usa o dia de São Paulo, não o UTC", () => {
    expect(todayIsoDate(new Date("2025-06-16T02:30:00Z"))).toBe("2025-06-15");
  });

  it("shiftDateOnly anda dias atravessando mês e ano", () => {
    expect(shiftDateOnly("2025-03-01", -1)).toBe("2025-02-28");
    expect(shiftDateOnly("2024-12-31", 1)).toBe("2025-01-01");
    expect(shiftDateOnly("2025-03-15", -29)).toBe("2025-02-14");
  });

  it("formatDateOnly formata a data civil sem fuso", () => {
    expect(formatDateOnly("2024-05-10")).toBe("10/05/2024");
    expect(formatDateOnly("2024-05-10T00:00:00.000Z")).toBe("10/05/2024");
  });

  describe("formatUtcDate", () => {
    it("formata em pt-BR usando UTC (não volta um dia)", () => {
      expect(formatUtcDate("2024-05-10T00:00:00Z")).toBe("10/05/2024");
    });

    it("retorna travessão para data inválida", () => {
      expect(formatUtcDate("não é data")).toBe("—");
    });
  });
});
