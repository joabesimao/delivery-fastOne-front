import { useCallback, useSyncExternalStore } from "react";
import useRealtimeSocket from "./useRealtimeSocket";

const useRealtimeConnection = (): boolean => {
  const socket = useRealtimeSocket();

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!socket) return () => {};
      socket.on("connect", onChange);
      socket.on("disconnect", onChange);
      return () => {
        socket.off("connect", onChange);
        socket.off("disconnect", onChange);
      };
    },
    [socket],
  );

  return useSyncExternalStore(subscribe, () => socket?.connected ?? false);
};

export default useRealtimeConnection;
