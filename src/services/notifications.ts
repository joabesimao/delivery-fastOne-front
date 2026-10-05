import api from "./api";
import type { UsuarioRole } from "../types/Usuario";

export type NotificationType =
  | "chat_message"
  | "oil_change_due"
  | "oil_change_created"
  | "fuel_refill_created"
  | "admin_notice";

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

// Eventos do socket (sala individual da conta).
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

export interface BroadcastNoticePayload {
  title: string;
  body: string;
  roles?: UsuarioRole[];
  unitStoreId?: number;
}

export const fetchNotifications = async (params: {
  cursor?: number | null;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationPage> => {
  const res = await api.get<NotificationPage>("/notifications", {
    params: {
      cursor: params.cursor ?? undefined,
      limit: params.limit,
      unreadOnly: params.unreadOnly ? "true" : undefined,
    },
  });
  return res.data;
};

export const fetchUnreadNotificationsCount = async (): Promise<number> => {
  const res = await api.get<{ unreadCount: number }>("/notifications/unread-count");
  return res.data.unreadCount;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (type?: NotificationType): Promise<void> => {
  await api.put("/notifications/read-all", type ? { type } : {});
};

export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

export const broadcastNotice = async (payload: BroadcastNoticePayload): Promise<number> => {
  const res = await api.post<{ recipients: number }>("/notifications/broadcast", payload);
  return res.data.recipients;
};
