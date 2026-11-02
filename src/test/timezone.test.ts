import { describe, expect, it } from "vitest";

describe("fuso horário dos testes", () => {
  it("usa America/Sao_Paulo", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      "America/Sao_Paulo",
    );
    expect(new Date(2024, 0, 15).getTimezoneOffset()).toBe(180);
  });
});
