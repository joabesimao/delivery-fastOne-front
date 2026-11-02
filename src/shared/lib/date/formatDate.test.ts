import { describe, expect, it, vi } from "vitest";
import {
  formatDate,
  formatDateLocal,
  formatDateOnlyLocal,
  formatDateTime,
  formatDateWithoutTimezone,
  formatRelative,
  parseDateOnlyLocal,
} from "./formatDate";

describe("formatDate", () => {
  it("formata string e Date no padrão DD/MM/YYYY", () => {
    expect(formatDate("2024-05-10T12:00:00")).toBe("10/05/2024");
    expect(formatDate(new Date(2024, 4, 10))).toBe("10/05/2024");
  });

  it("aceita padrão customizado", () => {
    expect(formatDate("2024-05-10T12:00:00", "YYYY-MM-DD")).toBe("2024-05-10");
  });

  it("retorna string vazia para null, undefined, vazio ou inválido", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
    expect(formatDate("xyz")).toBe("");
  });
});

describe("formatDateLocal", () => {
  it("ignora o Z e mantém o horário literal", () => {
    expect(formatDateLocal("2024-05-10T23:30:00Z", "DD/MM/YYYY HH:mm")).toBe(
      "10/05/2024 23:30",
    );
  });

  it("retorna string vazia para vazio ou inválido", () => {
    expect(formatDateLocal(null)).toBe("");
    expect(formatDateLocal("xyz")).toBe("");
  });
});

describe("formatDateWithoutTimezone", () => {
  it("não volta um dia para meia-noite UTC", () => {
    expect(formatDateWithoutTimezone("2024-05-10T00:00:00Z")).toBe(
      "10/05/2024",
    );
  });

  it("aceita data simples e padrão customizado", () => {
    expect(formatDateWithoutTimezone("2024-05-10")).toBe("10/05/2024");
    expect(formatDateWithoutTimezone("2024-05-10", "yyyy-MM-dd")).toBe(
      "2024-05-10",
    );
  });

  it("formata objetos Date", () => {
    expect(formatDateWithoutTimezone(new Date(2024, 4, 10))).toBe("10/05/2024");
  });

  it("retorna string vazia para vazio, Date inválida ou texto inválido", () => {
    expect(formatDateWithoutTimezone(null)).toBe("");
    expect(formatDateWithoutTimezone("")).toBe("");
    expect(formatDateWithoutTimezone(new Date("x"))).toBe("");
    expect(formatDateWithoutTimezone("abc")).toBe("");
  });

  it("retorna string vazia para data inexistente no calendário", () => {
    expect(formatDateWithoutTimezone("2023-02-29")).toBe("");
    expect(formatDateWithoutTimezone("2024-13-45")).toBe("");
    expect(formatDateWithoutTimezone("2024-04-31T00:00:00Z")).toBe("");
  });
});

describe("parseDateOnlyLocal", () => {
  it("cria Date local à meia-noite", () => {
    const date = parseDateOnlyLocal("2024-05-10T00:00:00Z");
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(4);
    expect(date?.getDate()).toBe(10);
    expect(date?.getHours()).toBe(0);
  });

  it("devolve a mesma Date quando válida", () => {
    const input = new Date(2024, 4, 10);
    expect(parseDateOnlyLocal(input)).toBe(input);
  });

  it("retorna null para vazio, inválido ou Date inválida", () => {
    expect(parseDateOnlyLocal(null)).toBeNull();
    expect(parseDateOnlyLocal("")).toBeNull();
    expect(parseDateOnlyLocal("abc")).toBeNull();
    expect(parseDateOnlyLocal("2024-xx-10")).toBeNull();
    expect(parseDateOnlyLocal(new Date("x"))).toBeNull();
  });

  it("retorna null para datas inexistentes no calendário", () => {
    expect(parseDateOnlyLocal("2024-13-45")).toBeNull();
    expect(parseDateOnlyLocal("2023-02-29")).toBeNull();
    expect(parseDateOnlyLocal("2024-00-10")).toBeNull();
    expect(parseDateOnlyLocal("2024-04-31")).toBeNull();
  });

  it("aceita 29 de fevereiro em ano bissexto", () => {
    const date = parseDateOnlyLocal("2024-02-29");
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(1);
    expect(date?.getDate()).toBe(29);
  });
});

describe("formatDateOnlyLocal", () => {
  it("formata como YYYY-MM-DD com zeros à esquerda", () => {
    expect(formatDateOnlyLocal("2024-05-03T00:00:00Z")).toBe("2024-05-03");
    expect(formatDateOnlyLocal(new Date(2024, 0, 9))).toBe("2024-01-09");
  });

  it("retorna string vazia para entrada inválida", () => {
    expect(formatDateOnlyLocal(null)).toBe("");
    expect(formatDateOnlyLocal("abc")).toBe("");
    expect(formatDateOnlyLocal("2023-02-29")).toBe("");
  });
});

describe("formatRelative", () => {
  it("retorna string vazia para vazio ou inválido", () => {
    expect(formatRelative(null)).toBe("");
    expect(formatRelative("xyz")).toBe("");
  });

  it("retorna texto relativo em português para data passada", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-10T12:00:00Z"));
    const result = formatRelative(new Date("2024-05-08T12:00:00Z"));
    vi.useRealTimers();
    expect(result).toBe("há 2 dias");
  });
});

describe("formatDateTime", () => {
  it("formata data e hora em pt-BR no fuso fixo", () => {
    expect(formatDateTime("2024-05-10T15:30:00Z")).toMatch(
      /^10\/05\/2024,? 12:30$/,
    );
  });

  it("retorna hífen para vazio ou inválido", () => {
    expect(formatDateTime(null)).toBe("-");
    expect(formatDateTime("")).toBe("-");
    expect(formatDateTime("xyz")).toBe("-");
  });
});
