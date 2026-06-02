const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const UNIT_ID_KEY = "unit_id";

export const getAccessToken = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
};

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(UNIT_ID_KEY);
};

export const isAuthenticated = (): boolean => Boolean(getAccessToken());