import { spawnSync } from "child_process";
import { existsSync } from "fs";
import puppeteer from "puppeteer";

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

const getPdfBrowserCandidates = () => [
  process.env.PDF_BROWSER_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_BIN,
  process.env.GOOGLE_CHROME_BIN,
  process.env.GOOGLE_CHROME_SHIM,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/opt/google/chrome/chrome",
  "/snap/bin/chromium",
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser"
];

const PDF_BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--no-zygote"
];

const resolveBrowserPathFromEnvPath = () => {
  const systemPath = normalizeBrowserValue(process.env.PATH);
  if (!systemPath) return null;

  const candidateNames = [
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "chrome"
  ];

  for (const segment of systemPath.split(":").map((item) => item.trim()).filter(Boolean)) {
    for (const name of candidateNames) {
      const candidate = `${segment}/${name}`;
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
};

const resolvePdfBrowserPath = () => {
  for (const candidate of getPdfBrowserCandidates()) {
    const resolvedPath = resolveBrowserCandidate(candidate);

    if (resolvedPath) {
      return resolvedPath;
    }
  }

  return resolveBrowserPathFromEnvPath();
};

const resolveBundledPuppeteerPath = () => {
  try {
    const executablePath = puppeteer.executablePath?.();
    return executablePath && existsSync(executablePath) ? executablePath : null;
  } catch {
    return null;
  }
};

const resolveLaunchExecutablePath = () => {
  const browserPath = resolvePdfBrowserPath() || resolveBundledPuppeteerPath();

  if (browserPath) {
    process.env.PUPPETEER_EXECUTABLE_PATH = browserPath;
  }

  return browserPath;
};

export const generatePdfBufferFromHtml = async (html, optionOverrides = {}) => {
  const browserPath = resolveLaunchExecutablePath();
  const options = {
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: "12mm",
      right: "10mm",
      bottom: "12mm",
      left: "10mm"
    },
    ...optionOverrides
  };
  const launchOptions = {
    headless: true,
    args: PDF_BROWSER_ARGS
  };

  if (browserPath) {
    launchOptions.executablePath = browserPath;
  } else {
    throw new Error(
      "PDF generation could not find a Chrome/Chromium browser. Set PDF_BROWSER_PATH to a valid Chrome/Chromium executable on the server."
    );
  }

  let browser;

  try {
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.emulateMediaType("screen");
    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    const buffer = await page.pdf(options);
    return buffer;
  } catch (error) {
    if (String(error?.message || "").includes("Failed to launch the browser process")) {
      throw new Error(
        browserPath
          ? `PDF generation could not launch the configured browser at ${browserPath}.`
          : "PDF generation could not find a local Chrome/Chromium installation. Set PDF_BROWSER_PATH in the server environment if Chrome is installed in a custom location."
      );
    }

    throw error;
  } finally {
    await browser?.close().catch(() => {});
  }
};
