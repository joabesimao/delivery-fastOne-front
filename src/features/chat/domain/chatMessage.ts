import type {
  RealtimeChatMessage,
  RealtimeSessionReady,
} from "@/shared/realtime/realtimeSocket";

export type ChatMessage = RealtimeChatMessage;
export type ChatSession = RealtimeSessionReady;

export interface ChatTypingEvent {
  accountId: number;
  name: string;
  isTyping: boolean;
}

export interface ChatAttachment {
  base64: string;
  mimeType: string;
  name: string;
}

export interface ChatSendPayload {
  text: string;
  imageBase64: string | null;
  imageMimeType: string | null;
  unitStoreId?: number;
}

export interface ChatAck {
  ok?: boolean;
  error?: string;
}

export type UnreadByStore = Record<number, number>;

export const toChatImageSrc = (
  base64: string | null,
  mimeType: string | null,
): string | null =>
  base64 ? `data:${mimeType || "image/jpeg"};base64,${base64}` : null;

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

const DAY_TIME: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

export const formatMessageTime = (
  isoDate: string,
  now = new Date(),
): string => {
  const date = new Date(isoDate);
  return isSameDay(date, now)
    ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleString("pt-BR", DAY_TIME);
};

export const formatMessageDayTime = (isoDate: string): string =>
  new Date(isoDate).toLocaleString("pt-BR", DAY_TIME);

export const groupMessagesByDate = (
  messages: ChatMessage[],
): { date: string; messages: ChatMessage[] }[] => {
  const grouped = new Map<string, ChatMessage[]>();
  messages.forEach((message) => {
    const key = new Date(message.createdAt).toLocaleDateString("pt-BR");
    grouped.set(key, [...(grouped.get(key) ?? []), message]);
  });
  return Array.from(grouped, ([date, items]) => ({ date, messages: items }));
};

export const formatDateHeader = (dateKey: string, now = new Date()): string => {
  const [day, month, year] = dateKey.split("/").map((part) => parseInt(part));
  const date = new Date(year, month - 1, day);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return dateKey;
};

export const applyTypingEvent = (
  typing: Map<number, string>,
  { accountId, name, isTyping }: ChatTypingEvent,
): Map<number, string> => {
  const next = new Map(typing);
  if (isTyping) next.set(accountId, name);
  else next.delete(accountId);
  return next;
};

export const typingLabelOf = (typing: Map<number, string>): string | null => {
  const names = Array.from(typing.values());
  if (names.length === 0) return null;
  return names.length === 1 ? names[0] : `${names[0]} e outros`;
};

export const canSendMessage = (
  text: string,
  attachment: ChatAttachment | null,
): boolean => text.trim().length > 0 || Boolean(attachment);

export const toSendPayload = (
  text: string,
  attachment: ChatAttachment | null,
  selectedUnitId: string,
): ChatSendPayload => ({
  text,
  imageBase64: attachment?.base64 ?? null,
  imageMimeType: attachment?.mimeType ?? null,
  unitStoreId: selectedUnitId ? Number(selectedUnitId) : undefined,
});

export const defaultUnitIdOf = (session: ChatSession): string =>
  session.account.unitStoreId ? String(session.account.unitStoreId) : "";

export const countsAsUnread = (
  message: ChatMessage,
  {
    myId,
    open,
    selectedUnitId,
  }: { myId?: number; open: boolean; selectedUnitId: string },
): boolean => {
  if (message.sender.id === myId) return false;
  const viewingStore =
    Boolean(selectedUnitId) && Number(selectedUnitId) === message.unitStoreId;
  return !(open && viewingStore);
};

export const incrementUnread = (
  unread: UnreadByStore,
  storeId: number,
): UnreadByStore => ({
  ...unread,
  [storeId]: (unread[storeId] ?? 0) + 1,
});

export const clearUnread = (
  unread: UnreadByStore,
  unitId: string,
): UnreadByStore => {
  const id = Number(unitId || 0);
  return id && unread[id] ? { ...unread, [id]: 0 } : unread;
};

export const totalUnread = (unread: UnreadByStore): number =>
  Object.values(unread).reduce((sum, value) => sum + value, 0);

export const searchResultsLabel = (count: number, query: string): string =>
  `${count} resultado${count !== 1 ? "s" : ""} para "${query}"`;
