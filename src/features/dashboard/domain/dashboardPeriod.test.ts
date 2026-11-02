import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PERIOD_OPTIONS,
  rangeForPeriod,
  todayInputRange,
  toInputDate,
} from "./dashboardPeriod";

const NOW = new Date("2025-03-15T15:00:00.000Z");
const emptyCustom = { start: "", end: "" };

describe("dashboardPeriod", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("toInputDate", () => {
    it("formata a data local com zero à esquerda", () => {
      expect(toInputDate(new Date(2025, 0, 5, 10))).toBe("2025-01-05");
    });

    it("usa o fuso local, não UTC", () => {
      expect(toInputDate(new Date("2025-03-16T01:30:00.000Z"))).toBe(
        "2025-03-15",
      );
    });
  });

  describe("todayInputRange", () => {
    it("retorna hoje como início e fim", () => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);

      expect(todayInputRange()).toEqual({
        start: "2025-03-15",
        end: "2025-03-15",
      });
    });
  });

  describe("rangeForPeriod", () => {
    it("today cobre de 00:00 a 23:59:59.999 do dia", () => {
      expect(rangeForPeriod("today", emptyCustom, NOW)).toEqual({
        startDate: "2025-03-15T03:00:00.000Z",
        endDate: "2025-03-16T02:59:59.999Z",
      });
    });

    it("7days inclui hoje e os 6 dias anteriores", () => {
      expect(rangeForPeriod("7days", emptyCustom, NOW)).toEqual({
        startDate: "2025-03-09T03:00:00.000Z",
        endDate: "2025-03-16T02:59:59.999Z",
      });
    });

    it("30days inclui hoje e os 29 dias anteriores", () => {
      expect(rangeForPeriod("30days", emptyCustom, NOW)).toEqual({
        startDate: "2025-02-14T03:00:00.000Z",
        endDate: "2025-03-16T02:59:59.999Z",
      });
    });

    it("custom usa o intervalo informado em horário local", () => {
      expect(
        rangeForPeriod(
          "custom",
          { start: "2025-03-01", end: "2025-03-10" },
          NOW,
        ),
      ).toEqual({
        startDate: "2025-03-01T03:00:00.000Z",
        endDate: "2025-03-11T02:59:59.999Z",
      });
    });

    it("custom vazio cai para o dia atual", () => {
      expect(rangeForPeriod("custom", emptyCustom, NOW)).toEqual({
        startDate: "2025-03-15T03:00:00.000Z",
        endDate: "2025-03-16T02:59:59.999Z",
      });
    });

    it("custom com apenas o início usa hoje como fim", () => {
      expect(
        rangeForPeriod("custom", { start: "2025-03-10", end: "" }, NOW),
      ).toEqual({
        startDate: "2025-03-10T03:00:00.000Z",
        endDate: "2025-03-16T02:59:59.999Z",
      });
    });

    it("usa a data atual do sistema quando now não é informado", () => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);

      expect(rangeForPeriod("today", emptyCustom).startDate).toBe(
        "2025-03-15T03:00:00.000Z",
      );
    });
  });

  it("PERIOD_OPTIONS lista os quatro períodos", () => {
    expect(PERIOD_OPTIONS.map((o) => o.value)).toEqual([
      "today",
      "7days",
      "30days",
      "custom",
    ]);
  });
});
