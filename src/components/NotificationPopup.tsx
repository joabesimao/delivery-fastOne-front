import { useEffect, useState } from "react";
import {
  Alert,
  Snackbar,
  IconButton,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useGetLatestUnread } from "../hooks/notification/useGetLatestUnread";
import { useMarkAsNotified } from "../hooks/notification/useMarkAsNotified";
import { ModuleEnumType, moduleTypeLabels } from "@/enums/moduleEnum";
import { Notification as NotificationItem } from "@/hooks/notification/useGetLatestUnread";
import { useNotificationCountSync } from "@/hooks/globalState/notification/useNotificationCount";
import { useAuth } from "@/hooks/globalState/auth/useAuth";

const NotificationPopup = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [openNotifications, setOpenNotifications] = useState<Set<number>>(
    new Set(),
  );
  const { data, isSuccess } = useGetLatestUnread();
  const { mutate: markAsNotified } = useMarkAsNotified();
  const user = useAuth((state) => state.user);
  const { refetch: refetchUnread } = useNotificationCountSync(user?.id);

  const handleMarkAsNotified = async (notificationIds: number[]) => {
    try {
      markAsNotified(notificationIds);
    } catch (error) {
      console.error("Erro ao marcar notificações como notificadas:", error);
    }
  };

  useEffect(() => {
    if (isSuccess && data?.data) {
      const unnotifiedNotifications = data.data.slice(0, 5);
      if (unnotifiedNotifications.length > 0) {
        setNotifications(unnotifiedNotifications);
        setOpenNotifications(new Set(unnotifiedNotifications.map((n) => n.id)));
        const notificationIds = unnotifiedNotifications.map((n) => n.id);
        handleMarkAsNotified(notificationIds);
        try {
          refetchUnread?.();
        } catch (e) {
          console.error(
            "Erro ao atualizar contagem de notificações não lidas:",
            e,
          );
        }
      }
    }
  }, [data, isSuccess]);

  const handleClose = (notificationId: number) => {
    setOpenNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }, 300);
  };

  if (notifications.length === 0) return null;

  return (
    <Stack
      spacing={1}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={openNotifications.has(notification.id)}
          autoHideDuration={30000}
          onClose={(_, reason) => {
            if (reason === "timeout") {
              handleClose(notification.id);
            }
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{
            position: "relative",
            bottom: "auto !important",
            right: "auto !important",
            transform: "none !important",
          }}
        >
          <Alert
            severity="info"
            variant="filled"
            sx={{
              bgcolor: "#0386D0",
              width: "100%",
              maxWidth: "400px",
              boxShadow: 3,
            }}
            onClose={() => handleClose(notification.id)}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                sx={{ width: "30px", height: "30px", borderRadius: "50%" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(notification.id);
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ mb: 0.5 }}
              >
                {notification.module === "VACANCY_MANAGEMENT"
                  ? "Nova vaga criada"
                  : notification.title}
              </Typography>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap="7px"
              >
                <Typography variant="body2">
                  Módulo:{" "}
                  {notification.module === "VACANCY_MANAGEMENT"
                    ? "Gestão de Vagas"
                    : moduleTypeLabels[notification.module as ModuleEnumType] ||
                      notification.module}
                </Typography>

                <Typography variant="caption">
                  {new Date(notification.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Stack>
            </Box>
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default NotificationPopup;
