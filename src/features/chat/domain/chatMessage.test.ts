import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyTypingEvent,
  canSendMessage,
  clearUnread,
  countsAsUnread,
  defaultUnitIdOf,
  formatDateHeader,
  formatMessageTime,
  groupMessagesByDate,
  incrementUnread,
  searchResultsLabel,
  toChatImageSrc,
  toSendPayload,
  totalUnread,
  typingLabelOf,
  type ChatMessage,
  type ChatSession,
} from "./chatMessage";

const msg = (
  id: number,
  createdAt: string,
  overrides: Partial<ChatMessage> = {},
): ChatMessage =>
  ({
    id,
    unitStoreId: 1,
    text: "oi",
    imageBase64: null,
    imageMimeType: null,
    createdAt,
    sender: {
      id: 10,
      name: "Ana",
      email: "a@x.com",
      role: "user",
      unitStoreId: 1,
    },
    unitStore: { id: 1, name: "Loja" },
    ...overrides,
  }) as ChatMessage;

afterEach(() => {
  vi.useRealTimers();
});

describe("toChatImageSrc", () => {
  it("monta data URL com mime informado ou jpeg por padrão", () => {
    expect(toChatImageSrc("AAA", "image/png")).toBe(
      "data:image/png;base64,AAA",
    );
    expect(toChatImageSrc("AAA", null)).toBe("data:image/jpeg;base64,AAA");
  });

  it("devolve null sem imagem", () => {
    expect(toChatImageSrc(null, "image/png")).toBeNull();
    expect(toChatImageSrc("", "image/png")).toBeNull();
  });
});

describe("formatMessageTime", () => {
  const now = new Date(2024, 4, 10, 15, 0);

  it("mostra só a hora para mensagens do mesmo dia", () => {
    expect(
      formatMessageTime(new Date(2024, 4, 10, 9, 5).toISOString(), now),
    ).toBe("09:05");
  });

  it("mostra dia/mês e hora para outros dias", () => {
    expect(
      formatMessageTime(new Date(2024, 4, 9, 9, 5).toISOString(), now),
    ).toBe("09/05, 09:05");
  });
});

describe("groupMessagesByDate", () => {
  it("agrupa por dia local preservando a ordem", () => {
    const a = msg(1, new Date(2024, 4, 9, 10, 0).toISOString());
    const b = msg(2, new Date(2024, 4, 9, 23, 0).toISOString());
    const c = msg(3, new Date(2024, 4, 10, 0, 30).toISOString());

    const groups = groupMessagesByDate([a, b, c]);

    expect(groups).toEqual([
      { date: "09/05/2024", messages: [a, b] },
      { date: "10/05/2024", messages: [c] },
    ]);
  });

  it("lista vazia gera nenhum grupo", () => {
    expect(groupMessagesByDate([])).toEqual([]);
  });
});

describe("formatDateHeader", () => {
  const now = new Date(2024, 4, 10, 12, 0);

  it("retorna Hoje, Ontem ou a própria data", () => {
    expect(formatDateHeader("10/05/2024", now)).toBe("Hoje");
    expect(formatDateHeader("09/05/2024", now)).toBe("Ontem");
    expect(formatDateHeader("08/05/2024", now)).toBe("08/05/2024");
  });

  it("Ontem funciona na virada de mês", () => {
    expect(formatDateHeader("30/04/2024", new Date(2024, 4, 1))).toBe("Ontem");
  });

  it("usa a data atual do sistema por padrão", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 10, 12, 0));
    expect(formatDateHeader("10/05/2024")).toBe("Hoje");
  });
});

describe("typing", () => {
  it("applyTypingEvent adiciona e remove sem mutar o original", () => {
    const original = new Map<number, string>([[1, "Ana"]]);

    const added = applyTypingEvent(original, {
      accountId: 2,
      name: "Bia",
      isTyping: true,
    });
    expect([...added]).toEqual([
      [1, "Ana"],
      [2, "Bia"],
    ]);
    expect(original.size).toBe(1);

    const removed = applyTypingEvent(added, {
      accountId: 1,
      name: "Ana",
      isTyping: false,
    });
    expect([...removed]).toEqual([[2, "Bia"]]);
    expect(added.size).toBe(2);
  });

  it("typingLabelOf cobre nenhum, um e vários", () => {
    expect(typingLabelOf(new Map())).toBeNull();
    expect(typingLabelOf(new Map([[1, "Ana"]]))).toBe("Ana");
    expect(
      typingLabelOf(
        new Map([
          [1, "Ana"],
          [2, "Bia"],
        ]),
      ),
    ).toBe("Ana e outros");
  });
});

describe("canSendMessage", () => {
  const attachment = { base64: "x", mimeType: "image/png", name: "a.png" };

  it("permite texto não vazio ou anexo", () => {
    expect(canSendMessage("oi", null)).toBe(true);
    expect(canSendMessage("   ", attachment)).toBe(true);
  });

  it("bloqueia texto em branco sem anexo", () => {
    expect(canSendMessage("   ", null)).toBe(false);
    expect(canSendMessage("", null)).toBe(false);
  });
});

describe("toSendPayload", () => {
  it("sem anexo nem unidade", () => {
    expect(toSendPayload("oi", null, "")).toEqual({
      text: "oi",
      imageBase64: null,
      imageMimeType: null,
      unitStoreId: undefined,
    });
  });

  it("com anexo e unidade", () => {
    expect(
      toSendPayload("", { base64: "x", mimeType: "image/png", name: "a" }, "4"),
    ).toEqual({
      text: "",
      imageBase64: "x",
      imageMimeType: "image/png",
      unitStoreId: 4,
    });
  });
});

describe("defaultUnitIdOf", () => {
  it("converte unitStoreId para string ou vazio", () => {
    const session = (unitStoreId: number | null) =>
      ({ account: { unitStoreId } }) as unknown as ChatSession;
    expect(defaultUnitIdOf(session(7))).toBe("7");
    expect(defaultUnitIdOf(session(null))).toBe("");
  });
});

describe("countsAsUnread", () => {
  const message = msg(1, "2024-05-10T10:00:00Z", { unitStoreId: 3 });

  it("mensagem própria não conta", () => {
    expect(
      countsAsUnread(message, { myId: 10, open: false, selectedUnitId: "" }),
    ).toBe(false);
  });

  it("não conta quando o chat está aberto na mesma loja", () => {
    expect(
      countsAsUnread(message, { myId: 99, open: true, selectedUnitId: "3" }),
    ).toBe(false);
  });

  it("conta com chat fechado, ou aberto em outra loja ou sem loja", () => {
    expect(
      countsAsUnread(message, { myId: 99, open: false, selectedUnitId: "3" }),
    ).toBe(true);
    expect(
      countsAsUnread(message, { myId: 99, open: true, selectedUnitId: "4" }),
    ).toBe(true);
    expect(
      countsAsUnread(message, { myId: 99, open: true, selectedUnitId: "" }),
    ).toBe(true);
  });
});

describe("unread", () => {
  it("incrementUnread inicia e soma sem mutar", () => {
    const base = { 1: 2 };
    const next = incrementUnread(incrementUnread(base, 1), 5);
    expect(next).toEqual({ 1: 3, 5: 1 });
    expect(base).toEqual({ 1: 2 });
  });

  it("clearUnread zera a loja e mantém as outras", () => {
    const base = { 1: 2, 2: 4 };
    expect(clearUnread(base, "2")).toEqual({ 1: 2, 2: 0 });
    expect(base[2]).toBe(4);
  });

  it("clearUnread devolve o mesmo objeto quando nada a limpar", () => {
    const base = { 1: 2 };
    expect(clearUnread(base, "")).toBe(base);
    expect(clearUnread(base, "9")).toBe(base);
    expect(clearUnread({ 1: 0 }, "1")).toEqual({ 1: 0 });
  });

  it("totalUnread soma todas as lojas", () => {
    expect(totalUnread({})).toBe(0);
    expect(totalUnread({ 1: 2, 2: 3 })).toBe(5);
  });
});

describe("searchResultsLabel", () => {
  it("usa singular e plural", () => {
    expect(searchResultsLabel(1, "ana")).toBe('1 resultado para "ana"');
    expect(searchResultsLabel(0, "x")).toBe('0 resultados para "x"');
    expect(searchResultsLabel(2, "x")).toBe('2 resultados para "x"');
  });
});
