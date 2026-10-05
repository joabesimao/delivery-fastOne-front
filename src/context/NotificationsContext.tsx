import { createContext } from "react";
import type { AppNotification, NotificationType } from "../services/notifications";

export type NotificationsFilter = "all" | "unread";

export interface NotificationsContextValue {
  items: AppNotification[];
  unreadCount: number;
  // Mensagens de chat não lidas (soma dos agrupamentos por loja).
  chatUnreadCount: number;
  filter: NotificationsFilter;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  setFilter: (filter: NotificationsFilter) => void;
  reload: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (notification: AppNotification) => Promise<void>;
  markAllRead: (type?: NotificationType) => Promise<void>;
  remove: (notification: AppNotification) => Promise<void>;
  openNotification: (notification: AppNotification) => void;
  // O widget flutuante avisa quando está aberto: conta como "vendo o chat".
  setChatWidgetOpen: (open: boolean) => void;
}

const noopAsync = async () => {};

export const NotificationsContext = createContext<NotificationsContextValue>({
  items: [],
  unreadCount: 0,
  chatUnreadCount: 0,
  filter: "all",
  hasMore: false,
  loading: false,
  loadingMore: false,
  setFilter: () => {},
  reload: noopAsync,
  loadMore: noopAsync,
  markRead: noopAsync,
  markAllRead: noopAsync,
  remove: noopAsync,
  openNotification: () => {},
  setChatWidgetOpen: () => {},
});
