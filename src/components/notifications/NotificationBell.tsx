import { Fragment, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  List,
  Paper,
  Popper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import useNotifications from "../../hooks/useNotifications";
import type { AppNotification } from "../../services/notifications";
import NotificationItem from "./NotificationItem";
import SendNoticeDialog from "./SendNoticeDialog";

const NotificationBell = ({ canSendNotice }: { canSendNotice: boolean }) => {
  const {
    items,
    unreadCount,
    filter,
    hasMore,
    loading,
    loadingMore,
    setFilter,
    reload,
    loadMore,
    markAllRead,
    remove,
    openNotification,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: "success" | "info" } | null>(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  const handleOpen = (notification: AppNotification) => {
    close();
    openNotification(notification);
  };

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton
          aria-label={unreadCount ? `Notificações, ${unreadCount} não lidas` : "Notificações"}
          onClick={(event) => {
            if (open) {
              close();
              return;
            }
            setAnchorEl(event.currentTarget);
            void reload();
          }}
        >
          <Badge color="error" badgeContent={unreadCount} max={99}>
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        sx={{ zIndex: (t) => t.zIndex.drawer + 2 }}
      >
        <ClickAwayListener onClickAway={close}>
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
            <Stack direction="row" alignItems="center" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
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
              onChange={(_, value) => setFilter(value)}
              sx={{ px: 1, minHeight: 40, "& .MuiTab-root": { minHeight: 40, textTransform: "none" } }}
            >
              <Tab value="all" label="Todas" />
              <Tab value="unread" label={unreadCount ? `Não lidas (${unreadCount})` : "Não lidas"} />
            </Tabs>
            <Divider />

            <Box sx={{ overflowY: "auto", flex: 1 }}>
              {loading && items.length === 0 ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                  <CircularProgress size={22} />
                </Box>
              ) : items.length === 0 ? (
                <Stack alignItems="center" spacing={1} sx={{ py: 5, px: 3, textAlign: "center" }}>
                  <NotificationsNoneOutlinedIcon sx={{ color: "text.disabled", fontSize: 36 }} />
                  <Typography variant="body2" color="text.secondary">
                    {filter === "unread" ? "Nenhuma notificação não lida." : "Você não tem notificações."}
                  </Typography>
                </Stack>
              ) : (
                <List disablePadding>
                  {items.map((notification, index) => (
                    <Fragment key={notification.id}>
                      {index > 0 ? <Divider component="li" /> : null}
                      <NotificationItem
                        notification={notification}
                        onOpen={handleOpen}
                        onRemove={(item) => void remove(item)}
                      />
                    </Fragment>
                  ))}
                </List>
              )}

              {hasMore ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 1 }}>
                  <Button size="small" onClick={() => void loadMore()} disabled={loadingMore}>
                    {loadingMore ? <CircularProgress size={16} /> : "Carregar mais"}
                  </Button>
                </Box>
              ) : null}
            </Box>

            {canSendNotice ? (
              <>
                <Divider />
                <Box sx={{ p: 1 }}>
                  <Button
                    fullWidth
                    startIcon={<CampaignOutlinedIcon fontSize="small" />}
                    onClick={() => {
                      close();
                      setNoticeOpen(true);
                    }}
                  >
                    Enviar aviso
                  </Button>
                </Box>
              </>
            ) : null}
          </Paper>
        </ClickAwayListener>
      </Popper>

      {canSendNotice ? (
        <SendNoticeDialog
          open={noticeOpen}
          onClose={() => setNoticeOpen(false)}
          onSent={(recipients) => {
            setNoticeOpen(false);
            setFeedback(
              recipients > 0
                ? {
                    message: `Aviso enviado para ${recipients} ${recipients === 1 ? "usuário" : "usuários"}.`,
                    severity: "success",
                  }
                : { message: "Nenhum usuário corresponde aos filtros escolhidos.", severity: "info" },
            );
          }}
        />
      ) : null}

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={feedback?.severity ?? "success"} variant="filled" onClose={() => setFeedback(null)}>
          {feedback?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationBell;
