import type { Socket } from "socket.io-client";
import httpClient from "@/shared/api/httpClient";
import type {
  ChatAck,
  ChatMessage,
  ChatSendPayload,
} from "../domain/chatMessage";

const SEARCH_LIMIT = 50;

const emitWithAck = (
  socket: Socket,
  event: string,
  payload: unknown,
): Promise<ChatAck> =>
  new Promise((resolve) =>
    socket.emit(event, payload, (ack: ChatAck) => resolve(ack ?? {})),
  );

export const chatGateway = {
  send: (socket: Socket, payload: ChatSendPayload) =>
    emitWithAck(socket, "chat:send", payload),

  deleteMessage: (socket: Socket, messageId: number) =>
    emitWithAck(socket, "chat:delete-message", { messageId }),

  fetchHistory: (socket: Socket) => socket.emit("chat:fetch-history"),

  setTyping: (socket: Socket, isTyping: boolean) =>
    socket.emit("chat:typing", { isTyping }),

  async search(query: string, accountId: number): Promise<ChatMessage[]> {
    const { data } = await httpClient.get<{ messages?: ChatMessage[] }>(
      "/chat/search",
      {
        params: { q: query, accountId, limit: SEARCH_LIMIT },
      },
    );
    return Array.isArray(data?.messages) ? data.messages : [];
  },
};
