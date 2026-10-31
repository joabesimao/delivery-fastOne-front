import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useRealtimeSocket from "@/shared/realtime/useRealtimeSocket";
import { deliveryKeys } from "./deliveryQueries";

const DELIVERY_CHANGED_EVENT = "delivery:changed";

export const useDeliveryRealtimeSync = (onChange?: () => void) => {
  const socket = useRealtimeSocket();
  const queryClient = useQueryClient();
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!socket) return;

    const handleChange = () => {
      onChangeRef.current?.();
      void queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
    };

    socket.on(DELIVERY_CHANGED_EVENT, handleChange);
    return () => {
      socket.off(DELIVERY_CHANGED_EVENT, handleChange);
    };
  }, [socket, queryClient]);
};
