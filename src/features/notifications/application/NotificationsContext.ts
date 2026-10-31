import { createContext } from "react";
import type {
  AppNotification,
  NotificationsFilter,
  NotificationType,
} from "../domain/notification";

export interface NotificationsContextValue {
  items: AppNotification[];
  unreadCount: number;
  chatUnreadCount: number;
  filter: NotificationsFilter;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  toast: AppNotification | null;
  setFilter: (filter: NotificationsFilter) => void;
  reload: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (notification: AppNotification) => Promise<void>;
  markAllRead: (type?: NotificationType) => Promise<void>;
  remove: (notification: AppNotification) => Promise<void>;
  openNotification: (notification: AppNotification) => void;
  dismissToast: () => void;
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
  toast: null,
  setFilter: () => {},
  reload: noopAsync,
  loadMore: noopAsync,
  markRead: noopAsync,
  markAllRead: noopAsync,
  remove: noopAsync,
  openNotification: () => {},
  dismissToast: () => {},
  setChatWidgetOpen: () => {},
});
