export const stripTrailingSlash = (value) =>
  typeof value === "string" ? value.trim().replace(/\/$/, "") : "";

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i;
const SCHEME_PATTERN = /^https?:\/\//i;
const SCHEME_RELATIVE_PATTERN = /^\/\//;
const DOMAIN_WITH_OPTIONAL_PATH_PATTERN =
  /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:\/.*)?$/i;
const LOCAL_HOST_WITH_OPTIONAL_PATH_PATTERN =
  /^(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/.*)?$/i;

export const normalizeAbsoluteUrl = (value, defaultProtocol = "https") => {
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (!trimmed) {
    return "";
  }

  if (SCHEME_PATTERN.test(trimmed)) {
    return stripTrailingSlash(trimmed);
  }

  if (SCHEME_RELATIVE_PATTERN.test(trimmed)) {
    return stripTrailingSlash(`${defaultProtocol}:${trimmed}`);
  }

  if (LOCAL_HOST_WITH_OPTIONAL_PATH_PATTERN.test(trimmed)) {
    return stripTrailingSlash(`http://${trimmed}`);
  }

  if (DOMAIN_WITH_OPTIONAL_PATH_PATTERN.test(trimmed)) {
    return stripTrailingSlash(`${defaultProtocol}://${trimmed}`);
  }

  return stripTrailingSlash(trimmed);
};

export const getServerOrigin = (req) => {
  const forwardedProto = req?.headers?.["x-forwarded-proto"]?.split(",")?.[0]?.trim();
  const forwardedHost = req?.headers?.["x-forwarded-host"]?.split(",")?.[0]?.trim();
  const host = forwardedHost || req?.get?.("host");
  const protocol = forwardedProto || req?.protocol;

  if (host && protocol) {
    return `${protocol}://${host}`.replace(/\/$/, "");
  }

  const configuredOrigin = normalizeAbsoluteUrl(process.env.SERVER_ORIGIN);
  if (configuredOrigin) {
    return configuredOrigin;
  }

  return "http://localhost:5000";
};

export const getClientOrigin = (req) => {
  const configuredOrigin = normalizeAbsoluteUrl(process.env.CLIENT_URL);
  if (configuredOrigin) {
    return configuredOrigin;
  }

  const requestOrigin = normalizeAbsoluteUrl(req?.headers?.origin);
  if (requestOrigin) {
    return requestOrigin;
  }

  const serverOrigin = getServerOrigin(req);
  if (LOCAL_ORIGIN_PATTERN.test(serverOrigin)) {
    return "http://localhost:5173";
  }

  return serverOrigin;
};

export const buildServerUrl = (req, path) => {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${getServerOrigin(req)}${normalizedPath}`;
};

export const buildClientUrl = (req, path) => {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${getClientOrigin(req)}${normalizedPath}`;
};

export const normalizeServerDocumentUrl = (url, req, fallbackPath) => {
  const normalizedUrl = typeof url === "string" ? url.trim() : "";

  if (!normalizedUrl) {
    return fallbackPath ? buildServerUrl(req, fallbackPath) : "";
  }

  if (normalizedUrl.startsWith("/")) {
    return buildServerUrl(req, normalizedUrl);
  }

  if (LOCAL_ORIGIN_PATTERN.test(normalizedUrl)) {
    if (fallbackPath) {
      return buildServerUrl(req, fallbackPath);
    }

    return normalizedUrl.replace(LOCAL_ORIGIN_PATTERN, getServerOrigin(req));
  }

  return normalizedUrl;
};

export const normalizeClientDocumentUrl = (url, req, fallbackPath) => {
  const normalizedUrl = typeof url === "string" ? url.trim() : "";

  if (!normalizedUrl) {
    return fallbackPath ? buildClientUrl(req, fallbackPath) : "";
  }

  if (normalizedUrl.startsWith("/")) {
    return buildClientUrl(req, normalizedUrl);
  }

  const absoluteUrl = normalizeAbsoluteUrl(normalizedUrl);

  if (LOCAL_ORIGIN_PATTERN.test(absoluteUrl)) {
    if (fallbackPath) {
      return buildClientUrl(req, fallbackPath);
    }

    return absoluteUrl.replace(LOCAL_ORIGIN_PATTERN, getClientOrigin(req));
  }

  return absoluteUrl;
};
