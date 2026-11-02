import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  applyTypingEvent,
  typingLabelOf,
  type ChatTypingEvent,
} from "../domain/chatMessage";
import { chatGateway } from "../data/chatGateway";

const TYPING_STOP_DELAY_MS = 2000;

export const useChatTyping = (socket: Socket | null) => {
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(
    new Map(),
  );
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingRef = useRef(false);

  useEffect(() => {
    if (!socket) return;
    const onTyping = (event: ChatTypingEvent) =>
      setTypingUsers((current) => applyTypingEvent(current, event));
    socket.on("chat:typing", onTyping);
    return () => {
      socket.off("chat:typing", onTyping);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [socket]);

  const stopTyping = useCallback(() => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (typingRef.current && socket) {
      typingRef.current = false;
      chatGateway.setTyping(socket, false);
    }
  }, [socket]);

  const notifyTyping = useCallback(() => {
    if (!socket) return;
    if (!typingRef.current) {
      typingRef.current = true;
      chatGateway.setTyping(socket, true);
    }
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(stopTyping, TYPING_STOP_DELAY_MS);
  }, [socket, stopTyping]);

  return { typingLabel: typingLabelOf(typingUsers), notifyTyping, stopTyping };
};
