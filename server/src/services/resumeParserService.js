// Import the parser implementation directly: the package entry point runs a demo
// file when loaded from ESM, which is unsafe and fails in production/serverless use.
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

const MAX_TEXT_LENGTH = 60_000;

export async function extractResumeText(file) {
  const isPdf = file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname);
  const isDocx = file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || /\.docx$/i.test(file.originalname);
  if (!isPdf && !isDocx) throw Object.assign(new Error("Upload a PDF or DOCX resume."), { statusCode: 400 });
  const signature = file.buffer?.subarray(0, 4)?.toString("binary");
  if ((isPdf && signature !== "%PDF") || (isDocx && signature !== "PK\x03\x04")) {
    throw Object.assign(new Error("This file does not appear to be a valid resume document."), { statusCode: 400 });
  }
  try {
    const result = isPdf ? await pdf(file.buffer) : await mammoth.extractRawText({ buffer: file.buffer });
    const text = String(result.text || "").replace(/\0/g, "").replace(/\s{3,}/g, "\n\n").trim();
    if (text.length < 30) throw new Error("This document has no readable resume text.");
    return text.slice(0, MAX_TEXT_LENGTH);
  } catch (error) {
    if (error.statusCode) throw error;
    throw Object.assign(new Error("We couldn't read this resume. Please upload a different PDF or DOCX file."), { statusCode: 400 });
  }
}
