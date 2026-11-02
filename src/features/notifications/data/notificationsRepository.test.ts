import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { notificationsRepository } from "./notificationsRepository";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe("notificationsRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("list", () => {
    it("envia cursor, limit e unreadOnly como string", async () => {
      const page = { items: [], nextCursor: null };
      vi.mocked(httpClient.get).mockResolvedValue({ data: page });

      const result = await notificationsRepository.list({
        cursor: 10,
        limit: 15,
        unreadOnly: true,
      });

      expect(httpClient.get).toHaveBeenCalledWith("/notifications", {
        params: { cursor: 10, limit: 15, unreadOnly: "true" },
      });
      expect(result).toBe(page);
    });

    it("omite cursor nulo e unreadOnly falso", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: {} });

      await notificationsRepository.list({ cursor: null, limit: 5 });

      expect(httpClient.get).toHaveBeenCalledWith("/notifications", {
        params: { cursor: undefined, limit: 5, unreadOnly: undefined },
      });
    });
  });

  it("unreadCount devolve o número", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: { unreadCount: 4 } });
    expect(await notificationsRepository.unreadCount()).toBe(4);
    expect(httpClient.get).toHaveBeenCalledWith("/notifications/unread-count");
  });

  it("markRead envia PUT em /:id/read", async () => {
    await notificationsRepository.markRead(3);
    expect(httpClient.put).toHaveBeenCalledWith("/notifications/3/read");
  });

  it("markAllRead envia o tipo quando informado e corpo vazio caso contrário", async () => {
    await notificationsRepository.markAllRead("chat_message");
    expect(httpClient.put).toHaveBeenLastCalledWith("/notifications/read-all", {
      type: "chat_message",
    });
    await notificationsRepository.markAllRead();
    expect(httpClient.put).toHaveBeenLastCalledWith(
      "/notifications/read-all",
      {},
    );
  });

  it("remove envia DELETE", async () => {
    await notificationsRepository.remove(3);
    expect(httpClient.delete).toHaveBeenCalledWith("/notifications/3");
  });

  it("broadcast devolve o número de destinatários", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ data: { recipients: 8 } });
    const payload = { title: "T", body: "B" };
    expect(await notificationsRepository.broadcast(payload)).toBe(8);
    expect(httpClient.post).toHaveBeenCalledWith(
      "/notifications/broadcast",
      payload,
    );
  });

  it("propaga erros", async () => {
    vi.mocked(httpClient.get).mockRejectedValue(new Error("falhou"));
    await expect(notificationsRepository.unreadCount()).rejects.toThrow(
      "falhou",
    );
  });
});
