import { describe, expect, it } from "vitest";
import {
  businessDayKey,
  formatDate,
  formatDateTime,
  formatDayTime,
  formatLongDate,
  formatRelative,
  formatTime,
} from "./formatDate";

const LATE_NIGHT_UTC = "2024-05-11T01:30:00.000Z";

describe("formatDate", () => {
  it("formata o instante no fuso de São Paulo", () => {
    expect(formatDate(LATE_NIGHT_UTC)).toBe("10/05/2024");
    expect(formatDateTime(LATE_NIGHT_UTC)).toBe("10/05/2024, 22:30");
    expect(formatDayTime(LATE_NIGHT_UTC)).toBe("10/05, 22:30");
    expect(formatTime(LATE_NIGHT_UTC)).toBe("22:30");
  });

  it("aceita Date", () => {
    expect(formatDateTime(new Date(LATE_NIGHT_UTC))).toBe("10/05/2024, 22:30");
  });

  it("formata a data por extenso", () => {
    expect(formatLongDate(LATE_NIGHT_UTC)).toBe(
      "sexta-feira, 10 de maio de 2024",
    );
  });

  it("retorna o fallback para vazio ou inválido", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDateTime(undefined)).toBe("-");
    expect(formatTime("xyz")).toBe("-");
    expect(formatLongDate("")).toBe("");
  });
});

describe("businessDayKey", () => {
  it("devolve o dia civil em São Paulo", () => {
    expect(businessDayKey(LATE_NIGHT_UTC)).toBe("2024-05-10");
    expect(businessDayKey("2024-05-11T03:00:00.000Z")).toBe("2024-05-11");
  });

  it("retorna string vazia para inválido", () => {
    expect(businessDayKey(null)).toBe("");
    expect(businessDayKey("abc")).toBe("");
  });
});

describe("formatRelative", () => {
  it("retorna string vazia para vazio ou inválido", () => {
    expect(formatRelative(null)).toBe("");
    expect(formatRelative("xyz")).toBe("");
  });
});
