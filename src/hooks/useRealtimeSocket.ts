import { useEffect, useSyncExternalStore } from "react";
import type { Socket } from "socket.io-client";
import { getRealtimeSocket, onRealtimeSocketChange, peekRealtimeSocket } from "../services/realtime";

// Socket atual, acompanhando as recriações (ex.: token renovado). Use-o como dependência
// dos efeitos que registram listeners, para que eles migrem para o socket novo.
const useRealtimeSocket = (): Socket | null => {
  const socket = useSyncExternalStore(onRealtimeSocketChange, peekRealtimeSocket);

  useEffect(() => {
    // Cria (ou recria, se o token mudou) o socket; a troca chega pela assinatura acima.
    getRealtimeSocket();
  }, []);

  return socket;
};

export default useRealtimeSocket;
