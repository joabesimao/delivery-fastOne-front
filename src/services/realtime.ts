import { io, type Socket } from "socket.io-client";

type AccountRole = "principal" | "branch";

export type RealtimeSessionReady = {
  account: {
    id: number;
    name: string;
    email: string;
    role: AccountRole;
    unitStoreId: number | null;
  };
  units: Array<{
    id: number;
    name: string;
    parentStoreId: number | null;
    isMain: boolean;
  }>;
};

export type RealtimeChatMessage = {
  id: number;
  unitStoreId: number;
  text: string | null;
  imageBase64: string | null;
  imageMimeType: string | null;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    email: string;
    role: AccountRole;
    unitStoreId: number | null;
  };
  unitStore: {
    id: number;
    name: string;
  };
};

export type DeliveryChangedEvent = {
  eventType: "created" | "updated" | "deleted";
  unitStoreId: number | null;
  order: unknown;
  occurredAt: string;
};

let socketInstance: Socket | null = null;
let activeToken: string | null = null;

const resolveRealtimeUrl = (): string => {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

  try {
    const parsed = new URL(apiBaseUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "http://localhost:3000";
  }
};

export const getRealtimeSocket = (): Socket | null => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  if (socketInstance && activeToken === token) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  const socket = io(resolveRealtimeUrl(), {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: {
      token,
    },
  });

  socketInstance = socket;
  activeToken = token;

  return socket;
};

export const closeRealtimeSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = null;
  activeToken = null;
};
