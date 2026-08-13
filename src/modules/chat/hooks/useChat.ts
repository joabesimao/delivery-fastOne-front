import { useState, useCallback, useEffect } from "react";
import type { Socket } from "socket.io-client";
import {
  getRealtimeSocket,
  type RealtimeChatMessage,
  type RealtimeSessionReady,
} from "../services/realtime";

export interface UseChatOptions {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export const useChat = (options?: UseChatOptions) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<RealtimeSessionReady | null>(null);
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar socket
  useEffect(() => {
    const currentSocket = getRealtimeSocket();

    if (!currentSocket) {
      const errorMsg = "Sessão sem token. Faça login para usar o chat.";
      setError(errorMsg);
      options?.onError?.(errorMsg);
      setLoading(false);
      return;
    }

    setSocket(currentSocket);
    setIsConnected(currentSocket.connected);

    const onSessionReady = (payload: RealtimeSessionReady) => {
      setSession(payload);
      setError(null);
    };

    const onHistory = (payload: RealtimeChatMessage[]) => {
      setMessages(payload);
      setLoading(false);
    };

    const onMessage = (payload: RealtimeChatMessage) => {
      setMessages((current) => [...current, payload]);
    };

    const onConnectError = () => {
      setIsConnected(false);
      const errorMsg =
        "Não foi possível conectar ao chat em tempo real. Reconectando...";
      setError(errorMsg);
      options?.onError?.(errorMsg);
    };

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    currentSocket.on("session:ready", onSessionReady);
    currentSocket.on("chat:history", onHistory);
    currentSocket.on("chat:message", onMessage);
    currentSocket.on("connect_error", onConnectError);
    currentSocket.on("connect", onConnect);
    currentSocket.on("disconnect", onDisconnect);

    return () => {
      currentSocket.off("session:ready", onSessionReady);
      currentSocket.off("chat:history", onHistory);
      currentSocket.off("chat:message", onMessage);
      currentSocket.off("connect_error", onConnectError);
      currentSocket.off("connect", onConnect);
      currentSocket.off("disconnect", onDisconnect);
    };
  }, [options]);

  const sendMessage = useCallback(
    (
      text: string,
      imageBase64?: string | null,
      imageMimeType?: string | null,
      unitStoreId?: number,
    ): Promise<{ ok: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) {
          const error = "Socket não inicializado";
          options?.onError?.(error);
          resolve({ ok: false, error });
          return;
        }

        socket.emit(
          "chat:send",
          {
            text,
            imageBase64,
            imageMimeType,
            unitStoreId,
          },
          (response: { ok?: boolean; error?: string }) => {
            if (!response?.ok) {
              const error = response?.error || "Falha ao enviar mensagem.";
              options?.onError?.(error);
              resolve({ ok: false, error });
              return;
            }

            options?.onSuccess?.("Mensagem enviada com sucesso!");
            resolve({ ok: true });
          },
        );
      });
    },
    [socket, options],
  );

  const refreshHistory = useCallback(() => {
    if (socket) {
      setLoading(true);
      socket.emit("chat:fetch-history");
    }
  }, [socket]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const deleteMessage = useCallback(
    (messageId: number): Promise<{ ok: boolean; error?: string }> => {
      return new Promise((resolve) => {
        if (!socket) {
          resolve({ ok: false, error: "Socket não inicializado" });
          return;
        }

        // Implementar quando backend suportar
        socket.emit("chat:delete-message", { messageId }, (response: { ok: boolean; error?: string }) => {
          resolve(response);
        });
      });
    },
    [socket],
  );

  return {
    // State
    socket,
    session,
    messages,
    loading,
    isConnected,
    error,

    // Actions
    sendMessage,
    refreshHistory,
    clearError,
    deleteMessage,
    setMessages,
    setSession,
    setError,
  };
};
