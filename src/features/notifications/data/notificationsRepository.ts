import httpClient from "@/shared/api/httpClient";
import type { BroadcastNoticePayload } from "../domain/notice";
import type {
  NotificationPage,
  NotificationType,
} from "../domain/notification";

interface NotificationPageQuery {
  cursor?: number | null;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationsRepository = {
  async list({
    cursor,
    limit,
    unreadOnly,
  }: NotificationPageQuery): Promise<NotificationPage> {
    const { data } = await httpClient.get<NotificationPage>("/notifications", {
      params: {
        cursor: cursor ?? undefined,
        limit,
        unreadOnly: unreadOnly ? "true" : undefined,
      },
    });
    return data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await httpClient.get<{ unreadCount: number }>(
      "/notifications/unread-count",
    );
    return data.unreadCount;
  },

  async markRead(id: number): Promise<void> {
    await httpClient.put(`/notifications/${id}/read`);
  },

  async markAllRead(type?: NotificationType): Promise<void> {
    await httpClient.put("/notifications/read-all", type ? { type } : {});
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/notifications/${id}`);
  },

  async broadcast(payload: BroadcastNoticePayload): Promise<number> {
    const { data } = await httpClient.post<{ recipients: number }>(
      "/notifications/broadcast",
      payload,
    );
    return data.recipients;
  },
};
