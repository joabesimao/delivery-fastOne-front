import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import { createFakeSocket } from "@/test/fakeSocket";
import type { AppNotification } from "../domain/notification";
import { notificationsRepository } from "../data/notificationsRepository";
import NotificationsProvider from "./NotificationsProvider";
import { useNotifications } from "./useNotifications";

vi.mock("@/shared/realtime/useRealtimeSocket", () => ({ default: vi.fn() }));
vi.mock("../data/notificationsRepository", () => ({
  notificationsRepository: {
    list: vi.fn(),
    unreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    remove: vi.fn(),
  },
}));

const repo = vi.mocked(notificationsRepository);

const makeNotification = (
  overrides: Partial<AppNotification> = {},
): AppNotification => ({
  id: 1,
  recipientId: 1,
  type: "oil_change_due",
  title: "Troca de óleo",
  body: "Moto ABC",
  link: null,
  data: null,
  readAt: null,
  createdAt: "2024-01-15T12:00:00.000Z",
  updatedAt: "2024-01-15T12:00:00.000Z",
  ...overrides,
});

const chatNotification = (id: number, count?: number) =>
  makeNotification({
    id,
    type: "chat_message",
    data: count ? { count } : null,
  });

describe("NotificationsProvider", () => {
  let socket: ReturnType<typeof createFakeSocket>;

  beforeEach(() => {
    socket = createFakeSocket();
    vi.mocked(useRealtimeSocket).mockReturnValue(socket as never);
    repo.list.mockResolvedValue({ items: [], nextCursor: null });
    repo.unreadCount.mockResolvedValue(0);
    repo.markRead.mockResolvedValue();
    repo.markAllRead.mockResolvedValue();
    repo.remove.mockResolvedValue();
  });

  const setup = async (route = "/") => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[route]}>
        <NotificationsProvider>{children}</NotificationsProvider>
      </MemoryRouter>
    );
    const hook = renderHook(
      () => ({ ctx: useNotifications(), location: useLocation() }),
      { wrapper },
    );
    await waitFor(() => expect(hook.result.current.ctx.loading).toBe(false));
    return hook;
  };

  const loadWith = async (
    items: AppNotification[],
    unread: number,
    nextCursor: number | null = null,
    route = "/",
  ) => {
    repo.list.mockResolvedValue({ items, nextCursor });
    repo.unreadCount.mockResolvedValue(unread);
    return setup(route);
  };

  describe("carregamento", () => {
    it("carrega a primeira página e a contagem de não lidas ao montar", async () => {
      const items = [makeNotification({ id: 1 }), makeNotification({ id: 2 })];
      const { result } = await loadWith(items, 2, 2);
      expect(repo.list).toHaveBeenCalledWith({
        limit: 15,
        unreadOnly: false,
      });
      expect(result.current.ctx.items).toEqual(items);
      expect(result.current.ctx.unreadCount).toBe(2);
      expect(result.current.ctx.hasMore).toBe(true);
    });

    it("sem cursor seguinte hasMore é falso", async () => {
      const { result } = await loadWith([makeNotification()], 1);
      expect(result.current.ctx.hasMore).toBe(false);
    });

    it("trocar o filtro para não lidas recarrega com unreadOnly", async () => {
      const { result } = await setup();
      act(() => result.current.ctx.setFilter("unread"));
      await waitFor(() =>
        expect(repo.list).toHaveBeenLastCalledWith({
          limit: 15,
          unreadOnly: true,
        }),
      );
      expect(result.current.ctx.filter).toBe("unread");
    });

    it("falha ao carregar mantém o estado e encerra o loading", async () => {
      repo.list.mockRejectedValue(new Error("rede"));
      const { result } = await setup();
      expect(result.current.ctx.items).toEqual([]);
      expect(result.current.ctx.unreadCount).toBe(0);
    });

    it("reload busca de novo e atualiza os itens", async () => {
      const { result } = await setup();
      repo.list.mockResolvedValue({
        items: [makeNotification({ id: 9 })],
        nextCursor: null,
      });
      repo.unreadCount.mockResolvedValue(1);
      await act(() => result.current.ctx.reload());
      expect(result.current.ctx.items.map((i) => i.id)).toEqual([9]);
      expect(result.current.ctx.unreadCount).toBe(1);
    });

    it("recarrega quando a aba volta a ficar visível", async () => {
      await setup();
      const before = repo.list.mock.calls.length;
      vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await waitFor(() => expect(repo.list.mock.calls.length).toBe(before + 1));
    });

    it("não recarrega quando a aba fica oculta", async () => {
      await setup();
      const before = repo.list.mock.calls.length;
      vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
      expect(repo.list.mock.calls.length).toBe(before);
    });
  });

  describe("paginação por cursor", () => {
    it("loadMore usa o cursor, anexa sem duplicar e atualiza o próximo cursor", async () => {
      const { result } = await loadWith(
        [makeNotification({ id: 1 }), makeNotification({ id: 2 })],
        2,
        2,
      );
      repo.list.mockResolvedValue({
        items: [makeNotification({ id: 2 }), makeNotification({ id: 3 })],
        nextCursor: null,
      });
      await act(() => result.current.ctx.loadMore());
      expect(repo.list).toHaveBeenLastCalledWith({
        cursor: 2,
        limit: 15,
        unreadOnly: false,
      });
      expect(result.current.ctx.items.map((i) => i.id)).toEqual([1, 2, 3]);
      expect(result.current.ctx.hasMore).toBe(false);
      expect(result.current.ctx.loadingMore).toBe(false);
    });

    it("loadMore sem próximo cursor não chama o repositório", async () => {
      const { result } = await setup();
      const calls = repo.list.mock.calls.length;
      await act(() => result.current.ctx.loadMore());
      expect(repo.list.mock.calls.length).toBe(calls);
    });

    it("falha no loadMore preserva os itens e o cursor", async () => {
      const { result } = await loadWith([makeNotification({ id: 1 })], 1, 1);
      repo.list.mockRejectedValue(new Error("rede"));
      await act(() => result.current.ctx.loadMore());
      expect(result.current.ctx.items).toHaveLength(1);
      expect(result.current.ctx.hasMore).toBe(true);
      expect(result.current.ctx.loadingMore).toBe(false);
    });
  });

  describe("marcar como lida", () => {
    it("atualiza de forma otimista, decrementa e chama a API", async () => {
      const { result } = await loadWith([makeNotification({ id: 1 })], 1);
      await act(() => result.current.ctx.markRead(result.current.ctx.items[0]));
      expect(result.current.ctx.items[0].readAt).not.toBeNull();
      expect(result.current.ctx.unreadCount).toBe(0);
      expect(repo.markRead).toHaveBeenCalledWith(1);
    });

    it("notificação já lida não faz nada", async () => {
      const read = makeNotification({ readAt: "2024-01-16T00:00:00.000Z" });
      const { result } = await loadWith([read], 3);
      await act(() => result.current.ctx.markRead(read));
      expect(repo.markRead).not.toHaveBeenCalled();
      expect(result.current.ctx.unreadCount).toBe(3);
    });

    it("a contagem não fica negativa", async () => {
      const { result } = await loadWith([makeNotification({ id: 1 })], 0);
      await act(() => result.current.ctx.markRead(result.current.ctx.items[0]));
      expect(result.current.ctx.unreadCount).toBe(0);
    });

    it("falha na API recarrega do servidor", async () => {
      const item = makeNotification({ id: 1 });
      const { result } = await loadWith([item], 1);
      repo.markRead.mockRejectedValue(new Error("rede"));
      const calls = repo.list.mock.calls.length;
      await act(() => result.current.ctx.markRead(item));
      await waitFor(() => expect(repo.list.mock.calls.length).toBe(calls + 1));
      await waitFor(() =>
        expect(result.current.ctx.items[0].readAt).toBeNull(),
      );
    });

    it("markAllRead sem tipo marca tudo e zera a contagem", async () => {
      const { result } = await loadWith(
        [makeNotification({ id: 1 }), makeNotification({ id: 2 })],
        2,
      );
      await act(() => result.current.ctx.markAllRead());
      expect(result.current.ctx.items.every((i) => i.readAt)).toBe(true);
      expect(result.current.ctx.unreadCount).toBe(0);
      expect(repo.markAllRead).toHaveBeenCalledWith(undefined);
    });

    it("markAllRead por tipo marca só o tipo e consulta a contagem real", async () => {
      const { result } = await loadWith(
        [makeNotification({ id: 1 }), chatNotification(2)],
        2,
      );
      repo.unreadCount.mockResolvedValue(1);
      await act(() => result.current.ctx.markAllRead("chat_message"));
      const [first, second] = result.current.ctx.items;
      expect(first.readAt).toBeNull();
      expect(second.readAt).not.toBeNull();
      expect(repo.markAllRead).toHaveBeenCalledWith("chat_message");
      expect(result.current.ctx.unreadCount).toBe(1);
    });

    it("falha em markAllRead recarrega do servidor", async () => {
      const { result } = await loadWith([makeNotification({ id: 1 })], 1);
      repo.markAllRead.mockRejectedValue(new Error("rede"));
      await act(() => result.current.ctx.markAllRead());
      await waitFor(() => expect(result.current.ctx.unreadCount).toBe(1));
      expect(result.current.ctx.items[0].readAt).toBeNull();
    });
  });

  describe("remover", () => {
    it("remove a notificação não lida e decrementa a contagem", async () => {
      const { result } = await loadWith(
        [makeNotification({ id: 1 }), makeNotification({ id: 2 })],
        2,
      );
      await act(() => result.current.ctx.remove(result.current.ctx.items[0]));
      expect(result.current.ctx.items.map((i) => i.id)).toEqual([2]);
      expect(result.current.ctx.unreadCount).toBe(1);
      expect(repo.remove).toHaveBeenCalledWith(1);
    });

    it("remover uma já lida não altera a contagem", async () => {
      const read = makeNotification({ id: 1, readAt: "2024-01-16T00:00:00Z" });
      const { result } = await loadWith([read], 4);
      await act(() => result.current.ctx.remove(read));
      expect(result.current.ctx.unreadCount).toBe(4);
    });

    it("falha na API recarrega do servidor", async () => {
      const item = makeNotification({ id: 1 });
      const { result } = await loadWith([item], 1);
      repo.remove.mockRejectedValue(new Error("rede"));
      await act(() => result.current.ctx.remove(item));
      await waitFor(() => expect(result.current.ctx.items).toHaveLength(1));
    });
  });

  describe("eventos de socket", () => {
    it("notification:new adiciona no topo, atualiza a contagem e mostra o toast", async () => {
      const { result } = await loadWith([makeNotification({ id: 1 })], 1);
      const incoming = makeNotification({ id: 2 });
      act(() =>
        socket.emit("notification:new", {
          notification: incoming,
          unreadCount: 2,
        }),
      );
      expect(result.current.ctx.items.map((i) => i.id)).toEqual([2, 1]);
      expect(result.current.ctx.unreadCount).toBe(2);
      expect(result.current.ctx.toast).toEqual(incoming);
    });

    it("notification:new de chat com o widget aberto não mostra toast e marca como lida", async () => {
      const { result } = await setup();
      act(() => result.current.ctx.setChatWidgetOpen(true));
      act(() =>
        socket.emit("notification:new", {
          notification: chatNotification(5),
          unreadCount: 1,
        }),
      );
      expect(result.current.ctx.toast).toBeNull();
      await waitFor(() =>
        expect(repo.markAllRead).toHaveBeenCalledWith("chat_message"),
      );
    });

    it("notification:new de chat na rota do chat não mostra toast", async () => {
      const { result } = await setup("/chat");
      act(() =>
        socket.emit("notification:new", {
          notification: chatNotification(5),
          unreadCount: 1,
        }),
      );
      expect(result.current.ctx.toast).toBeNull();
    });

    it("notification:new de chat fora do chat mostra toast", async () => {
      const { result } = await setup();
      const incoming = chatNotification(5);
      act(() =>
        socket.emit("notification:new", {
          notification: incoming,
          unreadCount: 1,
        }),
      );
      expect(result.current.ctx.toast).toEqual(incoming);
    });

    it("notification:read por ids marca só esses itens", async () => {
      const { result } = await loadWith(
        [makeNotification({ id: 1 }), makeNotification({ id: 2 })],
        2,
      );
      act(() => socket.emit("notification:read", { ids: [2], unreadCount: 1 }));
      const [first, second] = result.current.ctx.items;
      expect(first.readAt).toBeNull();
      expect(second.readAt).not.toBeNull();
      expect(result.current.ctx.unreadCount).toBe(1);
    });

    it("notification:read com all marca todos", async () => {
      const { result } = await loadWith(
        [makeNotification({ id: 1 }), makeNotification({ id: 2 })],
        2,
      );
      act(() =>
        socket.emit("notification:read", { all: true, unreadCount: 0 }),
      );
      expect(result.current.ctx.items.every((i) => i.readAt)).toBe(true);
      expect(result.current.ctx.unreadCount).toBe(0);
    });

    it("notification:deleted remove o item e atualiza a contagem", async () => {
      const { result } = await loadWith(
        [makeNotification({ id: 1 }), makeNotification({ id: 2 })],
        2,
      );
      act(() => socket.emit("notification:deleted", { id: 1, unreadCount: 1 }));
      expect(result.current.ctx.items.map((i) => i.id)).toEqual([2]);
      expect(result.current.ctx.unreadCount).toBe(1);
    });

    it("recarrega só nas reconexões, não na primeira conexão", async () => {
      await setup();
      const calls = repo.list.mock.calls.length;
      act(() => socket.emit("connect"));
      expect(repo.list.mock.calls.length).toBe(calls);
      await act(async () => socket.emit("connect"));
      await waitFor(() => expect(repo.list.mock.calls.length).toBe(calls + 1));
    });

    it("remove os listeners ao desmontar", async () => {
      const { unmount } = await setup();
      [
        "notification:new",
        "notification:read",
        "notification:deleted",
        "connect",
      ].forEach((event) => expect(socket.listenerCount(event)).toBe(1));
      unmount();
      [
        "notification:new",
        "notification:read",
        "notification:deleted",
        "connect",
      ].forEach((event) => expect(socket.listenerCount(event)).toBe(0));
    });

    it("funciona sem socket", async () => {
      vi.mocked(useRealtimeSocket).mockReturnValue(null);
      const { result } = await loadWith([makeNotification()], 1);
      expect(result.current.ctx.items).toHaveLength(1);
    });
  });

  describe("toast e navegação", () => {
    it("dismissToast esconde o toast", async () => {
      const { result } = await setup();
      act(() =>
        socket.emit("notification:new", {
          notification: makeNotification({ id: 3 }),
          unreadCount: 1,
        }),
      );
      act(() => result.current.ctx.dismissToast());
      expect(result.current.ctx.toast).toBeNull();
    });

    it("openNotification marca como lida, fecha o toast e navega ao link", async () => {
      const item = makeNotification({ id: 3, link: "/deliveries" });
      const { result } = await loadWith([item], 1);
      act(() =>
        socket.emit("notification:new", {
          notification: makeNotification({ id: 4 }),
          unreadCount: 2,
        }),
      );
      await act(async () => result.current.ctx.openNotification(item));
      expect(repo.markRead).toHaveBeenCalledWith(3);
      expect(result.current.ctx.toast).toBeNull();
      expect(result.current.location.pathname).toBe("/deliveries");
    });

    it("openNotification sem link não navega", async () => {
      const item = makeNotification({ id: 3, link: null });
      const { result } = await loadWith([item], 1, null, "/inicio");
      await act(async () => result.current.ctx.openNotification(item));
      expect(result.current.location.pathname).toBe("/inicio");
    });
  });

  describe("não lidas do chat", () => {
    it("soma a contagem agregada (data.count) das mensagens de chat não lidas", async () => {
      const { result } = await loadWith(
        [
          chatNotification(1, 3),
          chatNotification(2),
          makeNotification({ id: 3 }),
        ],
        5,
      );
      expect(result.current.ctx.chatUnreadCount).toBe(4);
    });

    it("na rota do chat marca as mensagens de chat como lidas automaticamente", async () => {
      await loadWith([chatNotification(1)], 1, null, "/chat");
      await waitFor(() =>
        expect(repo.markAllRead).toHaveBeenCalledWith("chat_message"),
      );
    });

    it("fora do chat não marca como lidas automaticamente", async () => {
      await loadWith([chatNotification(1)], 1);
      expect(repo.markAllRead).not.toHaveBeenCalled();
    });
  });
});
