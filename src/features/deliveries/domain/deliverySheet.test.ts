import { describe, expect, it } from "vitest";
import {
  DELIVERY_SHEET_FORMATS,
  sheetFileName,
  sheetPaperWidthMm,
  type DeliverySheet,
} from "./deliverySheet";

const sheet = (overrides: Partial<DeliverySheet> = {}): DeliverySheet => ({
  orderId: 42,
  createdAt: "2026-01-01T00:00:00.000Z",
  client: {
    registerId: 1,
    name: "Maria",
    phone: "",
    address: {
      street: "",
      neighborhood: "",
      numberHouse: "",
      reference: "",
      city: "",
    },
  },
  quantity: "1",
  amount: 10,
  ...overrides,
});

describe("sheetPaperWidthMm", () => {
  it("A4 não tem largura fixa e térmicas têm 80mm e 58mm", () => {
    expect(sheetPaperWidthMm("a4")).toBeUndefined();
    expect(sheetPaperWidthMm("thermal80")).toBe(80);
    expect(sheetPaperWidthMm("thermal58")).toBe(58);
  });
});

describe("DELIVERY_SHEET_FORMATS", () => {
  it("expõe os três formatos", () => {
    expect(DELIVERY_SHEET_FORMATS.map((f) => f.value)).toEqual([
      "a4",
      "thermal80",
      "thermal58",
    ]);
  });
});

describe("sheetFileName", () => {
  it("usa o id do pedido quando existe", () => {
    expect(sheetFileName(sheet())).toBe("folha-entrega-42");
  });

  it("usa o timestamp de criação quando não há id", () => {
    expect(sheetFileName(sheet({ orderId: null }))).toBe(
      `folha-entrega-${new Date("2026-01-01T00:00:00.000Z").getTime()}`,
    );
  });
});
