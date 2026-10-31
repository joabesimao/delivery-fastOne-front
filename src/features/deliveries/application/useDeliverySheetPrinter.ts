import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { exportHtmlToPdf } from "@/shared/lib/exportHtmlToPdf";
import { storage } from "@/shared/lib/storage";
import {
  sheetFileName,
  sheetPaperWidthMm,
  type DeliverySheet,
  type DeliverySheetFormat,
} from "../domain/deliverySheet";
import { deliverySheetConfig } from "./deliverySheetConfig";

const SKIP_PREVIEW_KEY = "delivery_sheet_skip_preview";

export const useDeliverySheetPrinter = () => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [sheet, setSheet] = useState<DeliverySheet | null>(null);
  const [format, setFormat] = useState<DeliverySheetFormat>(
    deliverySheetConfig.defaultFormat,
  );
  const [skipPreview, setSkipPreviewState] = useState(
    () => storage.get(SKIP_PREVIEW_KEY) === "1",
  );

  const setSkipPreview = (skip: boolean) => {
    setSkipPreviewState(skip);
    storage.set(SKIP_PREVIEW_KEY, skip ? "1" : "0");
  };

  const print = async (next: DeliverySheet) => {
    flushSync(() => setSheet(next));
    if (!sheetRef.current) return;
    const paperWidthMm = sheetPaperWidthMm(format);
    await exportHtmlToPdf({
      element: sheetRef.current,
      fileName: sheetFileName(next),
      margin: paperWidthMm ? 3 : 8,
      paperWidthMm,
      output: skipPreview ? "print" : "open",
    });
  };

  return {
    sheetRef,
    sheet,
    format,
    setFormat,
    skipPreview,
    setSkipPreview,
    print,
  };
};
