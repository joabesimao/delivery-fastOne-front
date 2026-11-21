import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PERIOD_OPTIONS,
  rangeForPeriod,
  todayInputRange,
} from "./dashboardPeriod";

const NOW = new Date("2025-03-15T15:00:00.000Z");
const emptyCustom = { start: "", end: "" };

describe("dashboardPeriod", () => {
  afterEach(() => {
    vi.useRealTimers();
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
    it("usa o dia de São Paulo mesmo depois da meia-noite UTC", () => {
      expect(
        rangeForPeriod(
          "today",
          emptyCustom,
          new Date("2025-03-16T01:00:00.000Z"),
        ),
      ).toEqual({ startDate: "2025-03-15", endDate: "2025-03-15" });
    });

    it("today envia o dia atual como início e fim", () => {
      expect(rangeForPeriod("today", emptyCustom, NOW)).toEqual({
        startDate: "2025-03-15",
        endDate: "2025-03-15",
      });
    });

    it("7days inclui hoje e os 6 dias anteriores", () => {
      expect(rangeForPeriod("7days", emptyCustom, NOW)).toEqual({
        startDate: "2025-03-09",
        endDate: "2025-03-15",
      });
    });

    it("30days inclui hoje e os 29 dias anteriores", () => {
      expect(rangeForPeriod("30days", emptyCustom, NOW)).toEqual({
        startDate: "2025-02-14",
        endDate: "2025-03-15",
      });
    });

    it("custom envia o intervalo informado", () => {
      expect(
        rangeForPeriod(
          "custom",
          { start: "2025-03-01", end: "2025-03-10" },
          NOW,
        ),
      ).toEqual({
        startDate: "2025-03-01",
        endDate: "2025-03-10",
      });
    });

    it("custom vazio cai para o dia atual", () => {
      expect(rangeForPeriod("custom", emptyCustom, NOW)).toEqual({
        startDate: "2025-03-15",
        endDate: "2025-03-15",
      });
    });

    it("custom com apenas o início usa hoje como fim", () => {
      expect(
        rangeForPeriod("custom", { start: "2025-03-10", end: "" }, NOW),
      ).toEqual({
        startDate: "2025-03-10",
        endDate: "2025-03-15",
      });
    });

    it("usa a data atual do sistema quando now não é informado", () => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);

      expect(rangeForPeriod("today", emptyCustom).startDate).toBe("2025-03-15");
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
