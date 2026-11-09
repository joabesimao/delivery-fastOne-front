import { useIsFetching, useQueryClient } from "@tanstack/react-query";

export const useRefreshActiveQueries = () => {
  const queryClient = useQueryClient();
  const refreshing = useIsFetching() > 0;

  const refresh = () =>
    queryClient.invalidateQueries({ refetchType: "active" });

  return { refresh, refreshing };
};
