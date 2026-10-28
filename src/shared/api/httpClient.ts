import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config/env";
import { session } from "../session/session";

const TOKEN_HEADER = "x-access-token";
const REFRESH_ENDPOINTS = ["/refresh-token", "/refreshToken", "/refresh"];
const AUTH_ROUTE_PATTERN = /\/login|\/refresh-token|\/refreshToken|\/refresh$/;
const PUBLIC_PATHS = ["/", "/login"];

const httpClient = axios.create({ baseURL: API_BASE_URL });

httpClient.interceptors.request.use((config) => {
  const accessToken = session.getAccessToken();
  if (accessToken) config.headers.set(TOKEN_HEADER, accessToken);
  return config;
});

const endSessionAndRedirect = () => {
  session.clear();
  if (!PUBLIC_PATHS.includes(window.location.pathname)) {
    window.location.href = "/";
  }
};

const requestNewAccessToken = async (): Promise<string | null> => {
  const refreshToken = session.getRefreshToken();
  if (!refreshToken) return null;

  for (const endpoint of REFRESH_ENDPOINTS) {
    try {
      const { data } = await axios.post<{
        accessToken?: string;
        refreshToken?: string;
      }>(`${API_BASE_URL}${endpoint}`, { refreshToken });

      if (data?.accessToken) {
        session.updateTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
    } catch {
      continue;
    }
  }

  return null;
};

const isDemoToken = (): boolean => {
  const accessToken = session.getAccessToken() ?? "";
  return (
    accessToken.includes("temporary-access-token-") ||
    accessToken.includes("test")
  );
};

let pendingRefresh: Promise<string | null> | null = null;

const refreshOnce = (): Promise<string | null> => {
  pendingRefresh ??= requestNewAccessToken().finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error?.response?.status;
    const isAuthRoute = AUTH_ROUTE_PATTERN.test(String(originalRequest?.url ?? ""));

    if (
      !originalRequest ||
      (status !== 401 && status !== 403) ||
      originalRequest._retry ||
      isAuthRoute ||
      isDemoToken()
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const newToken = await refreshOnce();
    if (!newToken) {
      endSessionAndRedirect();
      return Promise.reject(error);
    }

    originalRequest.headers.set(TOKEN_HEADER, newToken);
    return httpClient(originalRequest);
  },
);

export default httpClient;
