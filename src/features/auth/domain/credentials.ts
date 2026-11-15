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
  required: "Informe seu e-mail e senha para entrar.",
  invalidEmail: "Digite um e-mail válido, por exemplo: nome@empresa.com.",
  invalid: "E-mail ou senha incorretos. Confira os dados e tente novamente.",
  tooManyAttempts:
    "Muitas tentativas de acesso. Por segurança, aguarde alguns minutos e tente novamente.",
  offline:
    "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
  unavailable:
    "O sistema está instável no momento. Tente novamente em alguns instantes.",
  rejected: "Não foi possível entrar. Tente novamente.",
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCredentials = ({
  login,
  password,
}: LoginCredentials): string | null => {
  const trimmed = login.trim();
  if (!trimmed || !password) return LOGIN_MESSAGES.required;
  const isAdmin = trimmed.toLowerCase() === ADMIN_LOGIN;
  if (!isAdmin && !EMAIL_PATTERN.test(trimmed))
    return LOGIN_MESSAGES.invalidEmail;
  return null;
};

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

const MESSAGES_BY_STATUS: Record<number, string> = {
  400: LOGIN_MESSAGES.invalidEmail,
  401: LOGIN_MESSAGES.invalid,
  429: LOGIN_MESSAGES.tooManyAttempts,
};

export const loginErrorMessage = (error: unknown): string => {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (!status) return LOGIN_MESSAGES.offline;
  if (status >= 500) return LOGIN_MESSAGES.unavailable;
  return MESSAGES_BY_STATUS[status] ?? LOGIN_MESSAGES.rejected;
};
