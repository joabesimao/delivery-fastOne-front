import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/api/httpClient";
import { chatGateway } from "./chatGateway";

vi.mock("@/shared/api/httpClient", () => ({
  default: { get: vi.fn() },
}));

const socketWithAck = (ack: unknown) => ({
  emit: vi.fn((_event: string, _payload: unknown, cb?: (a: unknown) => void) =>
    cb?.(ack),
  ),
});

describe("chatGateway", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("send emite chat:send com o payload e resolve com o ack", async () => {
    const socket = socketWithAck({ ok: true });
    const payload = { text: "oi", imageBase64: null, imageMimeType: null };
    await expect(chatGateway.send(socket as never, payload)).resolves.toEqual({
      ok: true,
    });
    expect(socket.emit).toHaveBeenCalledWith(
      "chat:send",
      payload,
      expect.any(Function),
    );
  });

  it("send resolve com objeto vazio quando o ack vem indefinido", async () => {
    const socket = socketWithAck(undefined);
    await expect(
      chatGateway.send(socket as never, {
        text: "oi",
        imageBase64: null,
        imageMimeType: null,
      }),
    ).resolves.toEqual({});
  });

  it("deleteMessage emite chat:delete-message com o id", async () => {
    const socket = socketWithAck({ ok: true });
    await chatGateway.deleteMessage(socket as never, 7);
    expect(socket.emit).toHaveBeenCalledWith(
      "chat:delete-message",
      { messageId: 7 },
      expect.any(Function),
    );
  });

  it("fetchHistory e setTyping emitem os eventos esperados", () => {
    const socket = { emit: vi.fn() };
    chatGateway.fetchHistory(socket as never);
    chatGateway.setTyping(socket as never, true);
    expect(socket.emit).toHaveBeenNthCalledWith(1, "chat:fetch-history");
    expect(socket.emit).toHaveBeenNthCalledWith(2, "chat:typing", {
      isTyping: true,
    });
  });

  it("search envia q, accountId e limit e devolve as mensagens", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { messages: [{ id: 1 }] },
    });
    await expect(chatGateway.search("oi", 3)).resolves.toEqual([{ id: 1 }]);
    expect(httpClient.get).toHaveBeenCalledWith("/chat/search", {
      params: { q: "oi", accountId: 3, limit: 50 },
    });
  });

  it("search devolve lista vazia quando a resposta não tem messages", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: {} });
    await expect(chatGateway.search("oi", 3)).resolves.toEqual([]);
    vi.mocked(httpClient.get).mockResolvedValue({ data: null });
    await expect(chatGateway.search("oi", 3)).resolves.toEqual([]);
  });
});
