import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertTitle, Button, IconButton, Snackbar } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import useRealtimeSocket from "../hooks/useRealtimeSocket";
import {
  deleteNotification,
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationDeletedEvent,
  type NotificationNewEvent,
  type NotificationReadEvent,
  type NotificationType,
} from "../services/notifications";
import { NotificationsContext, type NotificationsFilter } from "./NotificationsContext";

const PAGE_SIZE = 15;
const CHAT_ROUTE = "/chat";

const messageCount = (notification: AppNotification): number => {
  const count = Number(notification.data?.count ?? 1);
  return Number.isFinite(count) && count > 0 ? count : 1;
};

const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<NotificationsFilter>("all");
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const socket = useRealtimeSocket();
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  // Mensagens de chat chegando enquanto o usuário já vê o chat (página ou widget).
  const viewingChat = location.pathname === CHAT_ROUTE || chatWidgetOpen;

  // Lido dentro dos handlers do socket sem re-registrar os listeners.
  const viewingChatRef = useRef(viewingChat);
  useEffect(() => {
    viewingChatRef.current = viewingChat;
  }, [viewingChat]);
  // A primeira conexão já é coberta pelo reload inicial; as seguintes podem ter perdido eventos.
  const connectedOnceRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await fetchUnreadNotificationsCount());
    } catch {
      // Mantém o último valor; o próximo evento ou foco da janela corrige.
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [page, count] = await Promise.all([
        fetchNotifications({ limit: PAGE_SIZE, unreadOnly: filter === "unread" }),
        fetchUnreadNotificationsCount(),
      ]);
      setItems(page.items);
      setNextCursor(page.nextCursor);
      setUnreadCount(count);
    } catch {
      // Sem rede/sessão: o sininho só fica sem itens.
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchNotifications({
        cursor: nextCursor,
        limit: PAGE_SIZE,
        unreadOnly: filter === "unread",
      });
      setItems((prev) => {
        const known = new Set(prev.map((item) => item.id));
        return [...prev, ...page.items.filter((item) => !known.has(item.id))];
      });
      setNextCursor(page.nextCursor);
    } catch {
      // Botão "Carregar mais" continua disponível para tentar de novo.
    } finally {
      setLoadingMore(false);
    }
  }, [filter, loadingMore, nextCursor]);

  const applyRead = useCallback((predicate: (item: AppNotification) => boolean) => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((item) => (!item.readAt && predicate(item) ? { ...item, readAt: now } : item)));
  }, []);

  const markRead = useCallback(
    async (notification: AppNotification) => {
      if (notification.readAt) return;
      applyRead((item) => item.id === notification.id);
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      try {
        await markNotificationRead(notification.id);
      } catch {
        void reload();
      }
    },
    [applyRead, reload],
  );

  const markAllRead = useCallback(
    async (type?: NotificationType) => {
      applyRead((item) => !type || item.type === type);
      if (!type) setUnreadCount(0);
      try {
        await markAllNotificationsRead(type);
        // Com filtro por tipo o total exato vem do servidor.
        if (type) await refreshUnreadCount();
      } catch {
        void reload();
      }
    },
    [applyRead, refreshUnreadCount, reload],
  );

  const remove = useCallback(
    async (notification: AppNotification) => {
      setItems((prev) => prev.filter((item) => item.id !== notification.id));
      if (!notification.readAt) setUnreadCount((prev) => Math.max(prev - 1, 0));
      try {
        await deleteNotification(notification.id);
      } catch {
        void reload();
      }
    },
    [reload],
  );

  const openNotification = useCallback(
    (notification: AppNotification) => {
      void markRead(notification);
      setToast(null);
      if (notification.link) navigate(notification.link);
    },
    [markRead, navigate],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!socket) return;

    const onNew = ({ notification, unreadCount: count }: NotificationNewEvent) => {
      setUnreadCount(count);
      setItems((prev) => [notification, ...prev.filter((item) => item.id !== notification.id)]);

      // Quem já vê o chat não precisa de toast; o efeito do chatUnreadCount marca como lida.
      if (notification.type === "chat_message" && viewingChatRef.current) return;
      setToast(notification);
    };

    const onRead = ({ ids, all, type, unreadCount: count }: NotificationReadEvent) => {
      setUnreadCount(count);
      applyRead((item) => (all ? !type || item.type === type : Boolean(ids?.includes(item.id))));
    };

    const onDeleted = ({ id, unreadCount: count }: NotificationDeletedEvent) => {
      setUnreadCount(count);
      setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const onConnect = () => {
      if (connectedOnceRef.current) void reload();
      connectedOnceRef.current = true;
    };

    socket.on("notification:new", onNew);
    socket.on("notification:read", onRead);
    socket.on("notification:deleted", onDeleted);
    socket.on("connect", onConnect);

    return () => {
      socket.off("notification:new", onNew);
      socket.off("notification:read", onRead);
      socket.off("notification:deleted", onDeleted);
      socket.off("connect", onConnect);
    };
  }, [applyRead, reload, socket]);

  // O socket pode ter sido recriado (refresh de token) e perdido eventos.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  const chatUnreadCount = useMemo(
    () =>
      items
        .filter((item) => item.type === "chat_message" && !item.readAt)
        .reduce((total, item) => total + messageCount(item), 0),
    [items],
  );

  useEffect(() => {
    if (viewingChat && chatUnreadCount > 0) {
      void markAllRead("chat_message");
    }
  }, [chatUnreadCount, viewingChat, markAllRead]);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      chatUnreadCount,
      filter,
      hasMore: Boolean(nextCursor),
      loading,
      loadingMore,
      setFilter,
      reload,
      loadMore,
      markRead,
      markAllRead,
      remove,
      openNotification,
      setChatWidgetOpen,
    }),
    [
      items,
      unreadCount,
      chatUnreadCount,
      filter,
      nextCursor,
      loading,
      loadingMore,
      reload,
      loadMore,
      markRead,
      markAllRead,
      remove,
      openNotification,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast ? `${toast.id}-${toast.updatedAt}` : undefined}
        open={Boolean(toast)}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setToast(null);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }}
      >
        <Alert
          severity={toast?.type === "oil_change_due" ? "warning" : "info"}
          variant="filled"
          action={
            <>
              {toast?.link ? (
                <Button color="inherit" size="small" onClick={() => toast && openNotification(toast)}>
                  Ver
                </Button>
              ) : null}
              <IconButton color="inherit" size="small" aria-label="Fechar" onClick={() => setToast(null)}>
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
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
