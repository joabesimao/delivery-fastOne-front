import { useCallback, useState } from "react";
import type { Socket } from "socket.io-client";
import { readFileAsDataUrl } from "@/shared/lib/readFileAsDataUrl";
import {
  canSendMessage,
  toSendPayload,
  type ChatAttachment,
} from "../domain/chatMessage";
import { chatGateway } from "../data/chatGateway";

interface ChatComposerOptions {
  socket: Socket | null;
  selectedUnitId: string;
  sendError: string;
  imageError: string;
  onError: (message: string | null) => void;
  beforeSend?: () => void;
  onTextChange?: () => void;
}

export const useChatComposer = ({
  socket,
  selectedUnitId,
  sendError,
  imageError,
  onError,
  beforeSend,
  onTextChange,
}: ChatComposerOptions) => {
  const [text, setTextState] = useState("");
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [sending, setSending] = useState(false);

  const setText = (value: string) => {
    setTextState(value);
    onTextChange?.();
  };

  const attach = async (file: File) => {
    try {
      const base64 = await readFileAsDataUrl(file);
      setAttachment({
        base64,
        mimeType: file.type || "image/jpeg",
        name: file.name,
      });
      onError(null);
    } catch {
      onError(imageError);
    }
  };

  const clearAttachment = useCallback(() => setAttachment(null), []);

  const send = async () => {
    if (!socket || !canSendMessage(text, attachment)) return;
    beforeSend?.();
    setSending(true);
    onError(null);
    const ack = await chatGateway.send(
      socket,
      toSendPayload(text, attachment, selectedUnitId),
    );
    setSending(false);
    if (!ack.ok) {
      onError(ack.error || sendError);
      return;
    }
    setTextState("");
    setAttachment(null);
  };

  return {
    text,
    setText,
    attachment,
    attach,
    clearAttachment,
    sending,
    canSend: canSendMessage(text, attachment) && !sending,
    send,
  };
};
