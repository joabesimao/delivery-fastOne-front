import type {
  ChatMessage,
  ChatSession,
} from "@/features/chat/domain/chatMessage";

export const makeChatMessage = (
  overrides: Partial<ChatMessage> = {},
): ChatMessage => ({
  id: 1,
  unitStoreId: 10,
  text: "olá",
  imageBase64: null,
  imageMimeType: null,
  createdAt: "2024-01-15T12:00:00.000Z",
  sender: {
    id: 2,
    name: "Maria",
    email: "maria@x.com",
    role: "principal",
    unitStoreId: 10,
  },
  unitStore: { id: 10, name: "Loja Centro" },
  ...overrides,
});

export const makeChatSession = (
  overrides: Partial<ChatSession["account"]> = {},
): ChatSession => ({
  account: {
    id: 1,
    name: "Eu",
    email: "eu@x.com",
    role: "principal",
    unitStoreId: 10,
    ...overrides,
  },
  units: [
    { id: 10, name: "Loja Centro", parentStoreId: null, isMain: true },
    { id: 20, name: "Loja Norte", parentStoreId: 10, isMain: false },
  ],
});
