import "../config/env.js";
import chromium from "@sparticuz/chromium";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import puppeteer from "puppeteer-core";

const PDF_DEFAULT_VIEWPORT = {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
  isLandscape: false
};

const PDF_BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--no-zygote"
];

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

const resolveLocalBrowserPath = () => {
  for (const candidate of getPdfBrowserCandidates()) {
    const resolvedPath = resolveBrowserCandidate(candidate);
    if (resolvedPath) {
      process.env.PUPPETEER_EXECUTABLE_PATH = resolvedPath;
      return resolvedPath;
    }
  }

  const resolvedFromPath = resolveBrowserPathFromEnvPath();
  if (resolvedFromPath) {
    process.env.PUPPETEER_EXECUTABLE_PATH = resolvedFromPath;
  }

  return resolvedFromPath;
};

const isServerlessChromiumRuntime = () =>
  Boolean(
    process.env.VERCEL ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_LAMBDA_FUNCTION_VERSION ||
      process.env.LAMBDA_TASK_ROOT
  );

const resolveLaunchConfig = async () => {
  if (isServerlessChromiumRuntime()) {
    chromium.setGraphicsMode = false;
    const executablePath = await chromium.executablePath();

    if (!executablePath) {
      throw new Error(
        "PDF generation could not prepare the serverless Chromium binary. Ensure @sparticuz/chromium is installed in the backend deployment."
      );
    }

    return {
      browserPath: executablePath,
      launchOptions: {
        executablePath,
        args: puppeteer.defaultArgs({
          args: chromium.args,
          headless: "shell"
        }),
        defaultViewport: PDF_DEFAULT_VIEWPORT,
        headless: "shell",
        ignoreHTTPSErrors: true
      }
    };
  }

  const executablePath = resolveLocalBrowserPath();

  if (!executablePath) {
    throw new Error(
      "PDF generation could not find a Chrome/Chromium browser. Set PDF_BROWSER_PATH to a valid Chrome/Chromium executable on the server."
    );
  }

  return {
    browserPath: executablePath,
    launchOptions: {
      executablePath,
      args: PDF_BROWSER_ARGS,
      defaultViewport: PDF_DEFAULT_VIEWPORT,
      headless: true,
      ignoreHTTPSErrors: true
    }
  };
};

export const generatePdfBufferFromHtml = async (html, optionOverrides = {}) => {
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

  let browser;
  let browserPath = "";

  try {
    const launchConfig = await resolveLaunchConfig();
    browserPath = launchConfig.browserPath;
    browser = await puppeteer.launch(launchConfig.launchOptions);

    const page = await browser.newPage();
    await page.emulateMediaType("screen");
    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    return await page.pdf(options);
  } catch (error) {
    const message = String(error?.message || "");

    if (
      message.includes("Could not find Chrome") ||
      message.includes("Could not find expected browser") ||
      message.includes("Failed to launch the browser process")
    ) {
      throw new Error(
        browserPath
          ? `PDF generation could not launch the configured browser at ${browserPath}.`
          : "PDF generation could not initialize a Chromium runtime for this deployment."
      );
    }

    throw error;
  } finally {
    await browser?.close().catch(() => {});
  }
};
