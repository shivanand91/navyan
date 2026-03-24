import { existsSync } from "fs";
import htmlPdfNode from "html-pdf-node";

const PDF_BROWSER_CANDIDATES = [
  process.env.PDF_BROWSER_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);

const resolvePdfBrowserPath = () => {
  for (const candidate of PDF_BROWSER_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
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
