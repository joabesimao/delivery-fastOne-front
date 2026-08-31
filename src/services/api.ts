import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    config.headers = config.headers || {};
    config.headers['x-access-token'] = accessToken;
  }

  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const clearSessionAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUserEmail');

  if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
    window.location.href = '/';
  }
};

const tryRefreshToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const refreshCandidates = ['/refresh-token', '/refreshToken', '/refresh'];

  for (const endpoint of refreshCandidates) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        { refreshToken },
      );

      const newAccessToken = response.data?.accessToken;
      const newRefreshToken = response.data?.refreshToken;

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);

        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        return newAccessToken;
      }
    } catch {
      // Tenta o proximo endpoint candidato.
    }
  }

  return null;
};

const isDemoToken = (): boolean => {
  const accessToken = localStorage.getItem('accessToken') ?? '';
  return Boolean(accessToken && (accessToken.includes('temporary-access-token-') || accessToken.includes('test')));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const status = error?.response?.status;
    const requestUrl = String(originalRequest?.url ?? '');
    const isAuthRoute = /\/login|\/refresh-token|\/refreshToken|\/refresh$/.test(requestUrl);

    if ((status !== 401 && status !== 403) || originalRequest?._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    if (isDemoToken()) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = tryRefreshToken();
      }

      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (!newToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers['x-access-token'] = newToken;

      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshPromise = null;
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    }
  },
);

export default api;