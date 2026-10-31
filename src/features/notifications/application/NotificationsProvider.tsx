import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import {
  NOTIFICATIONS_PAGE_SIZE,
  appendPage,
  countUnreadChatMessages,
  markItemsRead,
  prependNotification,
  readEventMatcher,
  shouldToast,
  withoutNotification,
  type AppNotification,
  type NotificationDeletedEvent,
  type NotificationNewEvent,
  type NotificationReadEvent,
  type NotificationsFilter,
  type NotificationType,
} from "../domain/notification";
import { notificationsRepository } from "../data/notificationsRepository";
import { NotificationsContext } from "./NotificationsContext";

const decrement = (count: number) => Math.max(count - 1, 0);

const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const socket = useRealtimeSocket();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<NotificationsFilter>("all");
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  const viewingChat = pathname === ROUTES.chat || chatWidgetOpen;
  const viewingChatRef = useRef(viewingChat);
  useEffect(() => {
    viewingChatRef.current = viewingChat;
  }, [viewingChat]);
  const connectedOnceRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await notificationsRepository.unreadCount());
    } catch {
      return;
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [page, count] = await Promise.all([
        notificationsRepository.list({
          limit: NOTIFICATIONS_PAGE_SIZE,
          unreadOnly: filter === "unread",
        }),
        notificationsRepository.unreadCount(),
      ]);
      setItems(page.items);
      setNextCursor(page.nextCursor);
      setUnreadCount(count);
    } catch {
      return;
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await notificationsRepository.list({
        cursor: nextCursor,
        limit: NOTIFICATIONS_PAGE_SIZE,
        unreadOnly: filter === "unread",
      });
      setItems((current) => appendPage(current, page.items));
      setNextCursor(page.nextCursor);
    } catch {
      return;
    } finally {
      setLoadingMore(false);
    }
  }, [filter, loadingMore, nextCursor]);

  const applyRead = useCallback(
    (predicate: (item: AppNotification) => boolean) => {
      const readAt = new Date().toISOString();
      setItems((current) => markItemsRead(current, predicate, readAt));
    },
    [],
  );

  const markRead = useCallback(
    async (notification: AppNotification) => {
      if (notification.readAt) return;
      applyRead((item) => item.id === notification.id);
      setUnreadCount(decrement);
      try {
        await notificationsRepository.markRead(notification.id);
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
        await notificationsRepository.markAllRead(type);
        if (type) await refreshUnreadCount();
      } catch {
        void reload();
      }
    },
    [applyRead, refreshUnreadCount, reload],
  );

  const remove = useCallback(
    async (notification: AppNotification) => {
      setItems((current) => withoutNotification(current, notification.id));
      if (!notification.readAt) setUnreadCount(decrement);
      try {
        await notificationsRepository.remove(notification.id);
      } catch {
        void reload();
      }
    },
    [reload],
  );

  const dismissToast = useCallback(() => setToast(null), []);

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

    const onNew = ({
      notification,
      unreadCount: count,
    }: NotificationNewEvent) => {
      setUnreadCount(count);
      setItems((current) => prependNotification(current, notification));
      if (shouldToast(notification, viewingChatRef.current))
        setToast(notification);
    };

    const onRead = (event: NotificationReadEvent) => {
      setUnreadCount(event.unreadCount);
      applyRead(readEventMatcher(event));
    };

    const onDeleted = ({
      id,
      unreadCount: count,
    }: NotificationDeletedEvent) => {
      setUnreadCount(count);
      setItems((current) => withoutNotification(current, id));
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

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  const chatUnreadCount = useMemo(
    () => countUnreadChatMessages(items),
    [items],
  );

  useEffect(() => {
    if (viewingChat && chatUnreadCount > 0) void markAllRead("chat_message");
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
      toast,
      setFilter,
      reload,
      loadMore,
      markRead,
      markAllRead,
      remove,
      openNotification,
      dismissToast,
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
      toast,
      reload,
      loadMore,
      markRead,
      markAllRead,
      remove,
      openNotification,
      dismissToast,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
