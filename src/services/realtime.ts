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
// session:ready só chega na conexão; guardado para quem montar depois.
let lastSessionReady: RealtimeSessionReady | null = null;
// Quem guarda listeners no socket precisa saber quando ele é recriado (ex.: token renovado).
const socketChangeListeners = new Set<(socket: Socket | null) => void>();

const notifySocketChange = (socket: Socket | null): void => {
  socketChangeListeners.forEach((listener) => listener(socket));
};

export const onRealtimeSocketChange = (listener: (socket: Socket | null) => void): (() => void) => {
  socketChangeListeners.add(listener);
  return () => {
    socketChangeListeners.delete(listener);
  };
};

// Erro no middleware de auth (ex.: token expirado na reconexão) não tem retry automático.
const AUTH_RETRY_DELAY_MS = 10_000;

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

// Socket atual sem criar um novo (para useSyncExternalStore).
export const peekRealtimeSocket = (): Socket | null => socketInstance;

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
    // Lido a cada (re)conexão: reconectar depois de renovar o token usa o token novo.
    auth: (cb) => cb({ token: localStorage.getItem("accessToken") ?? token }),
  });

  socket.on("session:ready", (payload: RealtimeSessionReady) => {
    lastSessionReady = payload;
  });

  socket.on("connect_error", () => {
    if (socket.active) return;
    // Recusado pelo servidor: tenta de novo quando a API já tiver renovado o token.
    setTimeout(() => {
      if (socketInstance === socket && !socket.connected) socket.connect();
    }, AUTH_RETRY_DELAY_MS);
  });

  socketInstance = socket;
  activeToken = token;
  notifySocketChange(socket);

  return socket;
};

export const closeRealtimeSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = null;
  activeToken = null;
  lastSessionReady = null;
  notifySocketChange(null);
};

export const getRealtimeSessionUnits = (): RealtimeSessionReady["units"] =>
  lastSessionReady?.units ?? [];
