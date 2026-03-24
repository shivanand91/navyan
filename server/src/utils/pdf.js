import { spawnSync } from "child_process";
import { existsSync } from "fs";
import htmlPdfNode from "html-pdf-node";

const normalizeBrowserValue = (value) =>
  typeof value === "string" ? value.trim().replace(/^['"]|['"]$/g, "") : "";

const resolveBrowserCommandPath = (command) => {
  if (!command) return null;

  const result = spawnSync("which", [command], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    return null;
  }

  const resolvedPath = result.stdout.trim();
  return resolvedPath && existsSync(resolvedPath) ? resolvedPath : null;
};

const resolveBrowserCandidate = (candidate) => {
  const normalized = normalizeBrowserValue(candidate);
  if (!normalized) return null;

  if (existsSync(normalized)) {
    return normalized;
  }

  if (!normalized.includes("/")) {
    return resolveBrowserCommandPath(normalized);
  }

  return null;
};

const PDF_BROWSER_CANDIDATES = [
  process.env.PDF_BROWSER_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_BIN,
  process.env.GOOGLE_CHROME_BIN,
  process.env.GOOGLE_CHROME_SHIM,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser"
];

const resolvePdfBrowserPath = () => {
  for (const candidate of PDF_BROWSER_CANDIDATES) {
    const resolvedPath = resolveBrowserCandidate(candidate);

    if (resolvedPath) {
      return resolvedPath;
    }
  }

  return null;
};

const ensurePdfBrowserPath = () => {
  const browserPath = resolvePdfBrowserPath();

  if (browserPath) {
    process.env.PUPPETEER_EXECUTABLE_PATH = browserPath;
  }

  return browserPath;
};

export const generatePdfBufferFromHtml = async (html, optionOverrides = {}) => {
  const browserPath = ensurePdfBrowserPath();
  const file = { content: html };
  const options = {
    format: "A4",
    printBackground: true,
    margin: {
      top: "12mm",
      right: "10mm",
      bottom: "12mm",
      left: "10mm"
    },
    ...optionOverrides
  };

  try {
    const buffer = await htmlPdfNode.generatePdf(file, options);
    return buffer;
  } catch (error) {
    if (String(error?.message || "").includes("Could not find expected browser")) {
      throw new Error(
        browserPath
          ? `PDF generation could not launch the configured browser at ${browserPath}.`
          : "PDF generation could not find a local Chrome/Chromium installation. Set PDF_BROWSER_PATH in the server environment if Chrome is installed in a custom location."
      );
    }

    throw error;
  }
};
