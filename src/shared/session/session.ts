import { storage } from "../lib/storage";

const KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  email: "currentUserEmail",
  name: "currentUserName",
  role: "currentUserRole",
} as const;

export interface SessionUser {
  email: string;
  name: string;
  role: string | null;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export const session = {
  getAccessToken: (): string | null => storage.get(KEYS.accessToken),

  getRefreshToken: (): string | null => storage.get(KEYS.refreshToken),

  isAuthenticated: (): boolean => Boolean(storage.get(KEYS.accessToken)),

  getUser: (): SessionUser => ({
    email: storage.get(KEYS.email) ?? "",
    name: storage.get(KEYS.name) ?? "",
    role: storage.get(KEYS.role),
  }),

  hasRole: (roles: readonly string[]): boolean => {
    const role = storage.get(KEYS.role);
    return role !== null && roles.includes(role);
  },

  start: ({ accessToken, refreshToken, user }: SessionData): void => {
    storage.set(KEYS.accessToken, accessToken);
    storage.set(KEYS.refreshToken, refreshToken);
    storage.set(KEYS.email, user.email);
    storage.set(KEYS.name, user.name);
    storage.set(KEYS.role, user.role ?? "user");
  },

  updateTokens: (accessToken: string, refreshToken?: string): void => {
    storage.set(KEYS.accessToken, accessToken);
    if (refreshToken) storage.set(KEYS.refreshToken, refreshToken);
  },

  clear: (): void => {
    Object.values(KEYS).forEach(storage.remove);
  },
};
