import { useEffect, useState } from "react";
import { useNotifications } from "@/features/notifications";
import {
  clearUnread,
  countsAsUnread,
  incrementUnread,
  totalUnread,
  type UnreadByStore,
} from "../domain/chatMessage";
import { useChatChannel } from "./useChatChannel";
import { useChatComposer } from "./useChatComposer";

export const useChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [unreadByStore, setUnreadByStore] = useState<UnreadByStore>({});
  const { setChatWidgetOpen } = useNotifications();

  const channel = useChatChannel({
    noTokenError: "Sessao sem token para chat.",
    connectError: "Falha ao conectar no chat em tempo real.",
    stopLoadingOnError: true,
    onMessage: (message, session) => {
      const unread = countsAsUnread(message, {
        myId: session?.account.id,
        open,
        selectedUnitId: channel.selectedUnitId,
      });
      if (unread)
        setUnreadByStore((current) =>
          incrementUnread(current, message.unitStoreId),
        );
    },
  });

  const composer = useChatComposer({
    socket: channel.socket,
    selectedUnitId: channel.selectedUnitId,
    sendError: "Nao foi possivel enviar a mensagem.",
    imageError: "Nao foi possivel carregar a foto.",
    onError: channel.setError,
  });

  const viewingUnit = open ? channel.selectedUnitId : null;
  const [clearedUnit, setClearedUnit] = useState<string | null>(null);
  if (viewingUnit !== clearedUnit) {
    setClearedUnit(viewingUnit);
    if (viewingUnit) setUnreadByStore((current) => clearUnread(current, viewingUnit));
  }

  useEffect(() => {
    setChatWidgetOpen(open);
    return () => setChatWidgetOpen(false);
  }, [open, setChatWidgetOpen]);


  const changeStore = (unitId: string) => {
    channel.setSelectedUnitId(unitId);
    setUnreadByStore((current) => clearUnread(current, unitId));
  };

  return {
    open,
    openWidget: () => setOpen(true),
    closeWidget: () => setOpen(false),
    channel,
    composer,
    unreadByStore,
    unreadTotal: totalUnread(unreadByStore),
    changeStore,
  };
};
