import type { DeliverySheetFormat } from "../domain/deliverySheet";

export const deliverySheetConfig = {
  companyName: import.meta.env.VITE_DELIVERY_COMPANY_NAME ?? "FastOne Delivery",
  companyDocument: import.meta.env.VITE_DELIVERY_COMPANY_DOCUMENT ?? "",
  defaultFormat:
    (import.meta.env.VITE_DELIVERY_SHEET_FORMAT as
      DeliverySheetFormat | undefined) ?? "a4",
};
