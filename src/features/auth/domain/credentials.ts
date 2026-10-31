import type { SessionData } from "@/shared/session/session";

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface LoginResult {
  accessToken?: string;
  refreshToken?: string;
  name?: string;
  role?: string;
}

const ADMIN_LOGIN = "admin";
const ADMIN_TECH_EMAIL = "admin@fastone.local";

export const DEFAULT_CREDENTIALS: LoginCredentials = {
  login: import.meta.env.VITE_DEFAULT_LOGIN ?? ADMIN_LOGIN,
  password: import.meta.env.VITE_DEFAULT_PASSWORD ?? "12345678",
};

export const LOGIN_MESSAGES = {
  required: "Informe login e senha.",
  rejected: "Nao foi possivel autenticar com as credenciais informadas.",
  invalid: "Login ou senha invalidos.",
} as const;

export const validateCredentials = ({
  login,
  password,
}: LoginCredentials): string | null =>
  !login.trim() || !password ? LOGIN_MESSAGES.required : null;

export const toLoginEmail = (login: string): string => {
  const trimmed = login.trim();
  return trimmed.toLowerCase() === ADMIN_LOGIN ? ADMIN_TECH_EMAIL : trimmed;
};

const toUserLabel = (login: string): string => {
  const normalized = login.trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === ADMIN_LOGIN || normalized === ADMIN_TECH_EMAIL)
    return ADMIN_LOGIN;
  return login.trim();
};

export const toSessionData = (
  login: string,
  {
    accessToken,
    refreshToken,
    role,
    name,
  }: LoginResult & { accessToken: string },
  now = Date.now(),
): SessionData => {
  const userLabel = toUserLabel(login) || login;
  return {
    accessToken,
    refreshToken: refreshToken || `static-refresh-${now}`,
    user: {
      email: userLabel,
      name: name || userLabel,
      role: role || "user",
    },
  };
};

export const loginErrorMessage = (error: unknown): string => {
  const data = (
    error as { response?: { data?: { error?: string; message?: string } } }
  )?.response?.data;
  return data?.error ?? data?.message ?? LOGIN_MESSAGES.invalid;
};
