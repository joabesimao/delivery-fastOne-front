import { describe, expect, it } from "vitest";
import {
  appendPage,
  countUnreadChatMessages,
  markItemsRead,
  prependNotification,
  readEventMatcher,
  shouldToast,
  withoutNotification,
  type AppNotification,
} from "./notification";

const make = (
  id: number,
  overrides: Partial<AppNotification> = {},
): AppNotification => ({
  id,
  recipientId: 1,
  type: "admin_notice",
  title: `t${id}`,
  body: "b",
  link: null,
  data: null,
  readAt: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("countUnreadChatMessages", () => {
  it("soma data.count das mensagens de chat não lidas", () => {
    const items = [
      make(1, { type: "chat_message", data: { count: 3 } }),
      make(2, { type: "chat_message" }),
      make(3, { type: "chat_message", data: { count: 5 }, readAt: "x" }),
      make(4, { type: "admin_notice", data: { count: 9 } }),
    ];
    expect(countUnreadChatMessages(items)).toBe(4);
  });

  it.each([[0], [-2], ["abc"], [null]])(
    "trata count inválido (%j) como 1",
    (count) => {
      expect(
        countUnreadChatMessages([
          make(1, { type: "chat_message", data: { count } }),
        ]),
      ).toBe(1);
    },
  );

  it("lista vazia soma zero", () => {
    expect(countUnreadChatMessages([])).toBe(0);
  });
});

describe("markItemsRead", () => {
  it("marca apenas não lidos que atendem ao predicado, sem mutar", () => {
    const items = [make(1), make(2), make(3, { readAt: "antes" })];
    const snapshot = structuredClone(items);

    const result = markItemsRead(items, () => true, "agora");

    expect(result.map((i) => i.readAt)).toEqual(["agora", "agora", "antes"]);
    expect(items).toEqual(snapshot);
    expect(result[2]).toBe(items[2]);
  });

  it("respeita o predicado", () => {
    const items = [make(1), make(2)];
    const result = markItemsRead(items, (i) => i.id === 2, "agora");
    expect(result[0].readAt).toBeNull();
    expect(result[1].readAt).toBe("agora");
  });
});

describe("readEventMatcher", () => {
  const a = make(1, { type: "chat_message" });
  const b = make(2, { type: "admin_notice" });

  it("por ids marca somente os listados", () => {
    const match = readEventMatcher({ ids: [2], unreadCount: 0 });
    expect(match(a)).toBe(false);
    expect(match(b)).toBe(true);
  });

  it("all sem tipo marca todos", () => {
    const match = readEventMatcher({ all: true, unreadCount: 0 });
    expect(match(a) && match(b)).toBe(true);
  });

  it("all com tipo filtra pelo tipo", () => {
    const match = readEventMatcher({
      all: true,
      type: "chat_message",
      unreadCount: 0,
    });
    expect(match(a)).toBe(true);
    expect(match(b)).toBe(false);
  });

  it("sem ids nem all não marca nada", () => {
    expect(readEventMatcher({ unreadCount: 0 })(a)).toBe(false);
  });
});

describe("prependNotification", () => {
  it("insere no início", () => {
    const items = [make(1)];
    const result = prependNotification(items, make(2));
    expect(result.map((i) => i.id)).toEqual([2, 1]);
    expect(items).toHaveLength(1);
  });

  it("substitui a existente com mesmo id movendo para o início", () => {
    const result = prependNotification(
      [make(1), make(2)],
      make(2, { title: "novo" }),
    );
    expect(result.map((i) => i.id)).toEqual([2, 1]);
    expect(result[0].title).toBe("novo");
  });
});

describe("appendPage", () => {
  it("anexa itens novos sem duplicar ids", () => {
    const result = appendPage([make(1), make(2)], [make(2), make(3)]);
    expect(result.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it("mantém o item já conhecido, não o da página", () => {
    const original = make(1, { title: "original" });
    const result = appendPage([original], [make(1, { title: "outro" })]);
    expect(result).toEqual([original]);
  });
});

describe("withoutNotification", () => {
  it("remove pelo id sem mutar", () => {
    const items = [make(1), make(2)];
    expect(withoutNotification(items, 1).map((i) => i.id)).toEqual([2]);
    expect(items).toHaveLength(2);
    expect(withoutNotification(items, 99)).toHaveLength(2);
  });
});

describe("shouldToast", () => {
  it("suprime toast de chat apenas quando o chat está sendo visto", () => {
    const chat = make(1, { type: "chat_message" });
    expect(shouldToast(chat, true)).toBe(false);
    expect(shouldToast(chat, false)).toBe(true);
    expect(shouldToast(make(2), true)).toBe(true);
  });
});
