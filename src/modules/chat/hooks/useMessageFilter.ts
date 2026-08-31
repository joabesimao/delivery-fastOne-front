import { useMemo } from "react";
import type { RealtimeChatMessage } from "../services/realtime";

export interface UseMessageFilterOptions {
  searchQuery?: string;
  unitStoreId?: string | number;
  senderId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export const useMessageFilter = (
  messages: RealtimeChatMessage[],
  options?: UseMessageFilterOptions,
) => {
  const filtered = useMemo(() => {
    let result = messages;

    // Filter by search query
    if (options?.searchQuery?.trim()) {
      const query = options.searchQuery.toLowerCase();
      result = result.filter((msg) => {
        const senderName = msg.sender?.name ?? "";
        const unitStoreName = msg.unitStore?.name ?? "";

        return (
          (msg.text && msg.text.toLowerCase().includes(query)) ||
          senderName.toLowerCase().includes(query) ||
          unitStoreName.toLowerCase().includes(query)
        );
      });
    }

    // Filter by store
    if (options?.unitStoreId) {
      const storeId =
        typeof options.unitStoreId === "string"
          ? parseInt(options.unitStoreId)
          : options.unitStoreId;
      result = result.filter((msg) => msg.unitStoreId === storeId);
    }

    // Filter by sender
    if (options?.senderId) {
      result = result.filter((msg) => msg.sender?.id === options.senderId);
    }

    // Filter by date range
    if (options?.dateFrom || options?.dateTo) {
      result = result.filter((msg) => {
        const msgDate = new Date(msg.createdAt);
        if (options.dateFrom && msgDate < options.dateFrom) return false;
        if (options.dateTo && msgDate > options.dateTo) return false;
        return true;
      });
    }

    return result;
  }, [messages, options]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const grouped: Record<string, RealtimeChatMessage[]> = {};

    filtered.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const dateKey = date.toLocaleDateString("pt-BR");

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });

    return Object.entries(grouped).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));
  }, [filtered]);

  // Statistics
  const stats = useMemo(() => {
    const stats = {
      total: filtered.length,
      withImages: filtered.filter((m) => m.imageBase64).length,
      withText: filtered.filter((m) => m.text).length,
      senderCount: new Set(filtered.map((m) => m.sender?.id).filter((id): id is number => Boolean(id))).size,
      storeCount: new Set(filtered.map((m) => m.unitStoreId)).size,
    };

    return stats;
  }, [filtered]);

  return {
    filtered,
    groupedByDate,
    stats,
  };
};
