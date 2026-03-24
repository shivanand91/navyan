const stripTrailingSlash = (value) =>
  typeof value === "string" ? value.trim().replace(/\/$/, "") : "";

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i;

export const getServerOrigin = (req) => {
  const forwardedProto = req?.headers?.["x-forwarded-proto"]?.split(",")?.[0]?.trim();
  const forwardedHost = req?.headers?.["x-forwarded-host"]?.split(",")?.[0]?.trim();
  const host = forwardedHost || req?.get?.("host");
  const protocol = forwardedProto || req?.protocol;

  if (host && protocol) {
    return `${protocol}://${host}`.replace(/\/$/, "");
  }

  const configuredOrigin = stripTrailingSlash(process.env.SERVER_ORIGIN);
  if (configuredOrigin) {
    return configuredOrigin;
  }

  return "http://localhost:5000";
};

export const buildServerUrl = (req, path) => {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${getServerOrigin(req)}${normalizedPath}`;
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
