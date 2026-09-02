import axios from "axios";

const ACCESS_TOKEN_STORAGE_KEY = "navyan_access_token";
const PRODUCTION_API_BASE_URL = "/api";
const LOCAL_API_URL_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?/i;
const DEFAULT_GET_CACHE_TTL = 5 * 60 * 1000;

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    if (!import.meta.env.DEV && LOCAL_API_URL_PATTERN.test(configuredUrl)) {
      return PRODUCTION_API_BASE_URL;
    }

    return configuredUrl.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return PRODUCTION_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    return PRODUCTION_API_BASE_URL;
  }

  return "http://127.0.0.1:5000/api";
};

const readStoredAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

let accessToken = readStoredAccessToken();
let refreshRequest = null;
let unauthorizedHandler = null;
const CACHE_PREFIX = "navyan_api_cache_";
const getCache = new Map();
const pendingGetRequests = new Map();

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true
});

const stableSerialize = (value) => {
  if (!value || typeof value !== "object") {
    return String(value ?? "");
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${key}:${stableSerialize(value[key])}`)
    .join(",")}}`;
};

const buildGetCacheKey = (url, config = {}) =>
  [
    accessToken ? "auth" : "public",
    api.defaults.baseURL,
    url,
    stableSerialize(config.params)
  ].join("|");

export const clearApiCache = () => {
  getCache.clear();
  pendingGetRequests.clear();
  
  if (typeof window !== "undefined") {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.warn("Failed to clear localStorage API cache", e);
    }
  }
};

const rawGet = api.get.bind(api);

api.get = (url, config = {}) => {
  const shouldSkipCache =
    config.cache === false ||
    config.responseType ||
    config.signal ||
    config.headers?.Range;

  if (shouldSkipCache) {
    return rawGet(url, config);
  }

  const cacheKey = buildGetCacheKey(url, config);
  const ttl = Number.isFinite(config.cacheTtl) ? config.cacheTtl : DEFAULT_GET_CACHE_TTL;
  
  // 1. Try to read from in-memory cache first
  let cached = getCache.get(cacheKey);

  // 2. Try to read from localStorage if not found in memory
  if (!cached && typeof window !== "undefined") {
    try {
      const serialized = localStorage.getItem(CACHE_PREFIX + cacheKey);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        if (parsed && parsed.createdAt && parsed.response) {
          cached = parsed;
          getCache.set(cacheKey, cached);
        }
      }
    } catch (e) {
      console.warn("Failed to read from localStorage API cache", e);
    }
  }

  // 3. If cache entry is found and not expired, return resolved promise
  if (cached && Date.now() - cached.createdAt < ttl) {
    const responseWithConfig = {
      ...cached.response,
      config: { ...config, url, baseURL: api.defaults.baseURL }
    };
    return Promise.resolve(responseWithConfig);
  }

  // 4. Return existing pending request to avoid duplicates
  const pendingRequest = pendingGetRequests.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  // 5. Fetch fresh data from server
  const request = rawGet(url, config)
    .then((response) => {
      const serializableResponse = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };

      const cacheEntry = {
        createdAt: Date.now(),
        response: serializableResponse
      };

      getCache.set(cacheKey, cacheEntry);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(cacheEntry));
        } catch (e) {
          console.warn("Failed to write to localStorage API cache", e);
        }
      }

      return response;
    })
    .finally(() => {
      pendingGetRequests.delete(cacheKey);
    });

  pendingGetRequests.set(cacheKey, request);
  return request;
};

export const setAccessToken = (token) => {
  const previousToken = accessToken;
  accessToken = token || null;

  if (previousToken !== accessToken) {
    clearApiCache();
  }

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
  (response) => {
    if (response.config?.method && response.config.method.toLowerCase() !== "get") {
      clearApiCache();
    }

    return response;
  },
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
