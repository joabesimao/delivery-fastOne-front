import axios from 'axios';
import { getAccessToken } from "@/utils/authSession";

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["x-access-token"] = token;
  }

  return config;
});

export default api;