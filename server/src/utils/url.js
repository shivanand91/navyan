export const normalizeHttpUrl = (value) => {
  const url = String(value || "").trim();

  if (!url) return "";

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
};
