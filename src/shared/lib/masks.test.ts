import { describe, it, expect } from "vitest";
import {
  currencyInputMask,
  isValidCPF,
  parseCurrencyToNumber,
  phoneMask,
} from "./masks";

describe("isValidCPF", () => {
  it("aceita CPF válido com e sem máscara", () => {
    expect(isValidCPF("52998224725")).toBe(true);
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });

  it("rejeita dígito verificador errado", () => {
    expect(isValidCPF("52998224724")).toBe(false);
  });

  it("rejeita sequência repetida", () => {
    expect(isValidCPF("11111111111")).toBe(false);
  });

  it("rejeita tamanho errado e vazio", () => {
    expect(isValidCPF("5299822472")).toBe(false);
    expect(isValidCPF("")).toBe(false);
  });

  it("rejeita entrada com mais de 11 dígitos, mesmo com prefixo válido", () => {
    expect(isValidCPF("529.982.247-25999")).toBe(false);
  });
});

describe("phoneMask", () => {
  it("retorna vazio sem dígitos", () => {
    expect(phoneMask("")).toBe("");
  });

  it("formata 2 dígitos", () => {
    expect(phoneMask("11")).toBe("(11");
  });

  it("formata 6 dígitos", () => {
    expect(phoneMask("119876")).toBe("(11)9876");
  });

  it("formata 10 dígitos", () => {
    expect(phoneMask("1133334444")).toBe("(11)3333-4444");
  });

  it("formata 11 dígitos", () => {
    expect(phoneMask("11987654321")).toBe("(11)98765-4321");
  });

  it("ignora caracteres não numéricos e limita a 11 dígitos", () => {
    expect(phoneMask("(11) 98765-4321999")).toBe("(11)98765-4321");
  });
});

describe("currencyInputMask", () => {
  it("retorna vazio sem dígitos", () => {
    expect(currencyInputMask("abc")).toBe("");
  });

  it("preenche centavos", () => {
    expect(currencyInputMask("5")).toBe("0,05");
    expect(currencyInputMask("50")).toBe("0,50");
  });

  it("aplica separador de milhar", () => {
    expect(currencyInputMask("123456")).toBe("1.234,56");
    expect(currencyInputMask("123456789")).toBe("1.234.567,89");
  });

  it("remove zeros à esquerda", () => {
    expect(currencyInputMask("0000150")).toBe("1,50");
  });
});

describe("parseCurrencyToNumber", () => {
  it("interpreta formato brasileiro", () => {
    expect(parseCurrencyToNumber("1.234,56")).toBe(1234.56);
  });

  it("interpreta formato americano", () => {
    expect(parseCurrencyToNumber("1,234.56")).toBe(1234.56);
  });

  it("interpreta vírgula decimal simples", () => {
    expect(parseCurrencyToNumber("12,5")).toBe(12.5);
  });

  it("ignora símbolo de moeda e espaços", () => {
    expect(parseCurrencyToNumber("R$ 10,00")).toBe(10);
  });

  it("retorna NaN para vazio, null e undefined", () => {
    expect(parseCurrencyToNumber("")).toBeNaN();
    expect(parseCurrencyToNumber("   ")).toBeNaN();
    expect(parseCurrencyToNumber(null)).toBeNaN();
    expect(parseCurrencyToNumber(undefined)).toBeNaN();
  });

  it("interpreta ponto como separador de milhar quando há grupos de 3 dígitos", () => {
    expect(parseCurrencyToNumber("1.234")).toBe(1234);
    expect(parseCurrencyToNumber("1.234.567")).toBe(1234567);
    expect(parseCurrencyToNumber("-1.234")).toBe(-1234);
  });

  it("interpreta ponto como decimal quando não é agrupamento de milhar", () => {
    expect(parseCurrencyToNumber("12.5")).toBe(12.5);
    expect(parseCurrencyToNumber("0.5")).toBe(0.5);
    expect(parseCurrencyToNumber("0.500")).toBe(0.5);
    expect(parseCurrencyToNumber("0.125")).toBe(0.125);
    expect(parseCurrencyToNumber("1234.5")).toBe(1234.5);
  });

  it("retorna NaN para texto sem dígitos", () => {
    expect(parseCurrencyToNumber("abc")).toBeNaN();
    expect(parseCurrencyToNumber("-")).toBeNaN();
    expect(parseCurrencyToNumber(".")).toBeNaN();
  });

  it("repassa números finitos e retorna NaN para não finitos", () => {
    expect(parseCurrencyToNumber(7.5)).toBe(7.5);
    expect(parseCurrencyToNumber(Infinity)).toBeNaN();
  });
});
