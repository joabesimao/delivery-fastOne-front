export type NotificationType =
  | "chat_message"
  | "oil_change_due"
  | "oil_change_created"
  | "fuel_refill_created"
  | "admin_notice";

export type NotificationsFilter = "all" | "unread";

export interface AppNotification {
  id: number;
  recipientId: number;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  nextCursor: number | null;
}

export interface NotificationNewEvent {
  notification: AppNotification;
  unreadCount: number;
}

export interface NotificationReadEvent {
  ids?: number[];
  all?: boolean;
  type?: NotificationType;
  unreadCount: number;
}

export interface NotificationDeletedEvent {
  id: number;
  unreadCount: number;
}

export const NOTIFICATIONS_PAGE_SIZE = 15;

const messageCount = (notification: AppNotification): number => {
  const count = Number(notification.data?.count ?? 1);
  return Number.isFinite(count) && count > 0 ? count : 1;
};

export const countUnreadChatMessages = (items: AppNotification[]): number =>
  items
    .filter((item) => item.type === "chat_message" && !item.readAt)
    .reduce((total, item) => total + messageCount(item), 0);

export const markItemsRead = (
  items: AppNotification[],
  predicate: (item: AppNotification) => boolean,
  readAt: string,
): AppNotification[] =>
  items.map((item) =>
    !item.readAt && predicate(item) ? { ...item, readAt } : item,
  );

export const readEventMatcher =
  ({ ids, all, type }: NotificationReadEvent) =>
  (item: AppNotification): boolean =>
    all ? !type || item.type === type : Boolean(ids?.includes(item.id));

export const prependNotification = (
  items: AppNotification[],
  notification: AppNotification,
): AppNotification[] => [
  notification,
  ...items.filter((item) => item.id !== notification.id),
];

export const appendPage = (
  items: AppNotification[],
  page: AppNotification[],
): AppNotification[] => {
  const known = new Set(items.map((item) => item.id));
  return [...items, ...page.filter((item) => !known.has(item.id))];
};

export const withoutNotification = (
  items: AppNotification[],
  id: number,
): AppNotification[] => items.filter((item) => item.id !== id);

export const shouldToast = (
  notification: AppNotification,
  viewingChat: boolean,
): boolean => !(notification.type === "chat_message" && viewingChat);
