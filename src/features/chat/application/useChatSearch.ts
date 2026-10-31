import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/lib/hooks/useDebouncedValue";
import type { ChatMessage } from "../domain/chatMessage";
import { chatGateway } from "../data/chatGateway";

const SEARCH_DEBOUNCE_MS = 350;

export const chatKeys = {
  all: ["chat"] as const,
  searches: () => [...chatKeys.all, "search"] as const,
  search: (query: string, accountId?: number) =>
    [...chatKeys.searches(), query, accountId] as const,
};

export const useChatSearch = (query: string, accountId: number | undefined) => {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS);

  const search = useQuery({
    queryKey: chatKeys.search(debounced, accountId),
    queryFn: () =>
      chatGateway.search(debounced, accountId as number).catch(() => []),
    enabled: Boolean(debounced && accountId),
    gcTime: 0,
  });

  const active = Boolean(trimmed && accountId);
  return {
    searching: active && (debounced !== trimmed || search.isFetching),
    results: active ? (search.data ?? []) : null,
  };
};

export const useRemoveFromChatSearch = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (messageId: number) =>
      queryClient.setQueriesData<ChatMessage[]>(
        { queryKey: chatKeys.searches() },
        (current) => current?.filter((message) => message.id !== messageId),
      ),
    [queryClient],
  );
};
