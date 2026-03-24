const isProduction = process.env.NODE_ENV === "production";

const parseBoolean = (value, fallback) => {
  if (typeof value !== "string") return fallback;

  if (value === "true") return true;
  if (value === "false") return false;

  return fallback;
};

const normalizeSameSite = (value, fallback) => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (normalized === "lax" || normalized === "strict" || normalized === "none") {
    return normalized;
  }

  return fallback;
};

const getBaseCookieOptions = () => {
  const secure = parseBoolean(process.env.COOKIE_SECURE, isProduction);
  const sameSite = normalizeSameSite(
    process.env.COOKIE_SAME_SITE,
    secure ? "none" : "lax"
  );

  return {
    httpOnly: true,
    sameSite: !secure && sameSite === "none" ? "lax" : sameSite,
    secure,
    domain: process.env.COOKIE_DOMAIN || undefined
  };
};

export const getRefreshCookieOptions = () => ({
  ...getBaseCookieOptions(),
  maxAge: 1000 * 60 * 60 * 24 * 30,
  path: "/api/auth"
});

export const getAccessCookieOptions = () => ({
  ...getBaseCookieOptions(),
  maxAge: 1000 * 60 * 60 * 24 * 30,
  path: "/api"
});
