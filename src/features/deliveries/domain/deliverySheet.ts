import type { DeliveryOrderClient } from "./deliveryOrder";

export type DeliverySheetFormat = "a4" | "thermal80" | "thermal58";

export interface DeliverySheet {
  orderId: number | null;
  createdAt: string;
  client: DeliveryOrderClient;
  quantity: string;
  amount: number;
}

export const DELIVERY_SHEET_FORMATS: {
  value: DeliverySheetFormat;
  label: string;
}[] = [
  { value: "a4", label: "A4" },
  { value: "thermal80", label: "Termica 80mm" },
  { value: "thermal58", label: "Termica 58mm" },
];

const PAPER_WIDTH_MM: Record<DeliverySheetFormat, number | undefined> = {
  a4: undefined,
  thermal80: 80,
  thermal58: 58,
};

export const sheetPaperWidthMm = (format: DeliverySheetFormat) =>
  PAPER_WIDTH_MM[format];

export const sheetFileName = (sheet: DeliverySheet): string =>
  `folha-entrega-${sheet.orderId ?? new Date(sheet.createdAt).getTime()}`;
