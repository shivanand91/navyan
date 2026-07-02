import axios from "axios";

const ACCESS_TOKEN_STORAGE_KEY = "navyan_access_token";
const PRODUCTION_API_BASE_URL = "https://navyan.vercel.app/api";
const LOCAL_API_URL_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?/i;

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    if (!import.meta.env.DEV && LOCAL_API_URL_PATTERN.test(configuredUrl)) {
      return PRODUCTION_API_BASE_URL;
    }

    return configuredUrl.replace(/\/$/, "");
  }

  if (!import.meta.env.DEV && typeof window !== "undefined") {
    return PRODUCTION_API_BASE_URL;
  }

  return "http://localhost:5000/api";
};

const readStoredAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

let accessToken = readStoredAccessToken();
let refreshRequest = null;
let unauthorizedHandler = null;

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true
});

export const setAccessToken = (token) => {
  accessToken = token || null;

  if (typeof window !== "undefined") {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
  }
};

export const getStoredAccessToken = () => readStoredAccessToken();

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error?.response?.status === 401;

    if (
      !isUnauthorized ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout")
    ) {
      if (isUnauthorized && unauthorizedHandler) {
        unauthorizedHandler();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshRequest) {
      refreshRequest = axios
        .post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        .then((response) => {
          setAccessToken(response.data.accessToken);
          return response.data.accessToken;
        })
        .finally(() => {
          refreshRequest = null;
        });
    }

    try {
      const refreshedToken = await refreshRequest;
      originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
      return Promise.reject(refreshError);
    }
  }
);

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ERR_NETWORK") {
    return "API server is not reachable. Check your backend deployment and VITE_API_URL configuration.";
  }

  return fallbackMessage;
};

export default api;
