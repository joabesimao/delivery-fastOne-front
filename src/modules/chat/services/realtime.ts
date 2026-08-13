import type { Socket } from 'socket.io-client';

export interface RealtimeChatMessage {
  id: number;
  text: string;
  senderId: number;
  createdAt: Date;
  imageBase64?: string;
  unitStoreId: number;
  sender?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  unitStore?: {
    id: number;
    name: string;
  };
}

export interface RealtimeSessionReady {
  sessionId: string;
  userId: number;
  unitStoreId: number;
}

export interface RealtimeError {
  code: string;
  message: string;
}

let socketInstance: Socket | null = null;

export const getRealtimeSocket = (): Socket | null => {
  return socketInstance;
};

export const initializeRealtimeSocket = (socket: Socket): void => {
  socketInstance = socket;
};

export const disconnectRealtime = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
