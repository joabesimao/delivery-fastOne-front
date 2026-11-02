import { useCallback, useEffect, useRef, useState } from "react";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import { session as authSession } from "@/shared/session/session";
import {
  defaultUnitIdOf,
  type ChatMessage,
  type ChatSession,
} from "../domain/chatMessage";
import { chatGateway } from "../data/chatGateway";

interface ChatChannelOptions {
  noTokenError: string;
  connectError: string;
  clearErrorOnConnect?: boolean;
  stopLoadingOnError?: boolean;
  syncDeletes?: boolean;
  onMessage?: (message: ChatMessage, session: ChatSession | null) => void;
  onDeleted?: (messageId: number) => void;
}

export const useChatChannel = (options: ChatChannelOptions) => {
  const socket = useRealtimeSocket();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const optionsRef = useRef(options);
  const sessionRef = useRef(session);
  useEffect(() => {
    optionsRef.current = options;
    sessionRef.current = session;
  });

  useEffect(() => {
    if (!socket) return;
    const { clearErrorOnConnect, stopLoadingOnError, syncDeletes } =
      optionsRef.current;

    const onSessionReady = (payload: ChatSession) => {
      setSession(payload);
      setSelectedUnitId(defaultUnitIdOf(payload));
      if (clearErrorOnConnect) setError(null);
    };
    const onHistory = (payload: ChatMessage[]) => {
      setMessages(payload);
      setLoading(false);
    };
    const onMessage = (payload: ChatMessage) => {
      setMessages((current) => [...current, payload]);
      setLoading(false);
      optionsRef.current.onMessage?.(payload, sessionRef.current);
    };
    const onDeleted = ({ messageId }: { messageId: number }) => {
      setMessages((current) =>
        current.filter((message) => message.id !== messageId),
      );
      optionsRef.current.onDeleted?.(messageId);
    };
    const onConnectError = () => {
      setError(optionsRef.current.connectError);
      if (stopLoadingOnError) setLoading(false);
    };
    const onConnect = () => setError(null);

    socket.on("session:ready", onSessionReady);
    socket.on("chat:history", onHistory);
    socket.on("chat:message", onMessage);
    socket.on("connect_error", onConnectError);
    if (syncDeletes) socket.on("chat:message-deleted", onDeleted);
    if (clearErrorOnConnect) socket.on("connect", onConnect);

    return () => {
      socket.off("session:ready", onSessionReady);
      socket.off("chat:history", onHistory);
      socket.off("chat:message", onMessage);
      socket.off("connect_error", onConnectError);
      socket.off("chat:message-deleted", onDeleted);
      socket.off("connect", onConnect);
    };
  }, [socket]);

  const refresh = useCallback(() => {
    if (!socket) return;
    chatGateway.fetchHistory(socket);
    setLoading(true);
  }, [socket]);

  const missingToken = !socket && !authSession.isAuthenticated();

  return {
    socket,
    session,
    messages,
    loading: missingToken ? false : loading,
    error: missingToken ? options.noTokenError : error,
    setError,
    selectedUnitId,
    setSelectedUnitId,
    refresh,
  };
};
