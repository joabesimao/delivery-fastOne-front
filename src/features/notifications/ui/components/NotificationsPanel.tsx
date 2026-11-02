import { Fragment } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import type {
  AppNotification,
  NotificationsFilter,
} from "../../domain/notification";
import { useNotifications } from "../../application/useNotifications";
import NotificationItem from "./NotificationItem";

interface NotificationsPanelProps {
  canSendNotice: boolean;
  onOpen: (notification: AppNotification) => void;
  onSendNotice: () => void;
}

const NotificationsPanel = ({
  canSendNotice,
  onOpen,
  onSendNotice,
}: NotificationsPanelProps) => {
  const {
    items,
    unreadCount,
    filter,
    hasMore,
    loading,
    loadingMore,
    setFilter,
    loadMore,
    markAllRead,
    remove,
  } = useNotifications();

  return (
    <Paper
      elevation={6}
      sx={{
        mt: 1,
        width: { xs: "calc(100vw - 24px)", sm: 400 },
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "min(560px, calc(100vh - 96px))",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{ px: 2, pt: 1.5, pb: 0.5 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
          Notificações
        </Typography>
        <Button
          size="small"
          startIcon={<DoneAllRoundedIcon fontSize="small" />}
          disabled={unreadCount === 0}
          onClick={() => void markAllRead()}
        >
          Marcar todas como lidas
        </Button>
      </Stack>

      <Tabs
        value={filter}
        onChange={(_, value: NotificationsFilter) => setFilter(value)}
        sx={{
          px: 1,
          minHeight: 40,
          "& .MuiTab-root": { minHeight: 40, textTransform: "none" },
        }}
      >
        <Tab value="all" label="Todas" />
        <Tab
          value="unread"
          label={unreadCount ? `Não lidas (${unreadCount})` : "Não lidas"}
        />
      </Tabs>
      <Divider />

      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {loading && items.length === 0 ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
            <CircularProgress size={22} />
          </Box>
        ) : items.length === 0 ? (
          <Stack
            alignItems="center"
            spacing={1}
            sx={{ py: 5, px: 3, textAlign: "center" }}
          >
            <NotificationsNoneOutlinedIcon
              sx={{ color: "text.disabled", fontSize: 36 }}
            />
            <Typography variant="body2" color="text.secondary">
              {filter === "unread"
                ? "Nenhuma notificação não lida."
                : "Você não tem notificações."}
            </Typography>
          </Stack>
        ) : (
          <List disablePadding>
            {items.map((notification, index) => (
              <Fragment key={notification.id}>
                {index > 0 && <Divider component="li" />}
                <NotificationItem
                  notification={notification}
                  onOpen={onOpen}
                  onRemove={(item) => void remove(item)}
                />
              </Fragment>
            ))}
          </List>
        )}

        {hasMore && (
          <Box sx={{ display: "grid", placeItems: "center", py: 1 }}>
            <Button
              size="small"
              onClick={() => void loadMore()}
              disabled={loadingMore}
            >
              {loadingMore ? <CircularProgress size={16} /> : "Carregar mais"}
            </Button>
          </Box>
        )}
      </Box>

      {canSendNotice && (
        <>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              startIcon={<CampaignOutlinedIcon fontSize="small" />}
              onClick={onSendNotice}
            >
              Enviar aviso
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default NotificationsPanel;
