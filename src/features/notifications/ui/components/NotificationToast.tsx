import { Alert, AlertTitle, Button, IconButton, Snackbar } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useNotifications } from "../../application/useNotifications";

const NotificationToast = () => {
  const { toast, dismissToast, openNotification } = useNotifications();

  return (
    <Snackbar
      key={toast ? `${toast.id}-${toast.updatedAt}` : undefined}
      open={Boolean(toast)}
      autoHideDuration={6000}
      onClose={(_, reason) => {
        if (reason !== "clickaway") dismissToast();
      }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity={toast?.type === "oil_change_due" ? "warning" : "info"}
        variant="filled"
        action={
          <>
            {toast?.link && (
              <Button
                color="inherit"
                size="small"
                onClick={() => openNotification(toast)}
              >
                Ver
              </Button>
            )}
            <IconButton
              color="inherit"
              size="small"
              aria-label="Fechar"
              onClick={dismissToast}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </>
        }
        sx={{ width: { xs: "100%", sm: 380 }, alignItems: "flex-start" }}
      >
        <AlertTitle sx={{ mb: 0.25 }}>{toast?.title}</AlertTitle>
        {toast?.body}
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
