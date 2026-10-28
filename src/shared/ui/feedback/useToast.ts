import { useContext } from "react";
import { ToastContext, type ToastApi } from "./ToastContext";

export const useToast = (): ToastApi => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  return context;
};
