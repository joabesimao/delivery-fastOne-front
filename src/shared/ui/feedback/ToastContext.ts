import { createContext } from "react";

export type ToastSeverity = "success" | "error" | "warning" | "info";

export interface ToastApi {
  show: (message: string, severity?: ToastSeverity) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
