import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";
import { ToastContext, type ToastApi, type ToastSeverity } from "./ToastContext";

const AUTO_HIDE_MS = 4000;

interface ToastState {
  key: number;
  message: string;
  severity: ToastSeverity;
}

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback((message: string, severity: ToastSeverity = "info") => {
    setToast({ key: Date.now(), message, severity });
    setOpen(true);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
    }),
    [show],
  );

  const close = () => setOpen(false);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        key={toast?.key}
        open={open}
        autoHideDuration={AUTO_HIDE_MS}
        onClose={(_, reason) => reason !== "clickaway" && close()}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={toast?.severity ?? "info"} variant="filled" onClose={close}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
