import "../config/env.js";
import { configureCloudinary } from "../config/cloudinary.js";
import fs from "fs/promises";
import path from "path";

const bufferToDataUri = (buffer, mimetype) => {
  const base64 = buffer.toString("base64");
  return `data:${mimetype};base64,${base64}`;
};

const isEphemeralFilesystemRuntime = () =>
  Boolean(
    process.env.VERCEL ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_LAMBDA_FUNCTION_VERSION ||
      process.env.LAMBDA_TASK_ROOT
  );

const ensureUploadsDir = async () => {
  const dir = path.join(process.cwd(), "uploads");
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

const extFromMime = (mimetype) => {
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype === "image/png") return "png";
  if (mimetype === "image/jpeg") return "jpg";
  if (mimetype === "image/webp") return "webp";
  return "bin";
};

export const uploadBuffer = async ({
  buffer,
  mimetype,
  folder,
  publicId,
  resourceType
}) => {
  const { enabled, client } = configureCloudinary();

  if (!enabled) {
    if (isEphemeralFilesystemRuntime()) {
      return { url: "", publicId: "", storage: "dynamic" };
    }

    const uploadsDir = await ensureUploadsDir();
    const safeFolder = (folder || "misc").replaceAll("/", "_");
    const safeId = (publicId || `file_${Date.now()}`).replaceAll("/", "_");
    const ext = extFromMime(mimetype);
    const filename = `${safeFolder}__${safeId}.${ext}`;
    const fullPath = path.join(uploadsDir, filename);
    await fs.writeFile(fullPath, buffer);
    const origin =
      (typeof process.env.SERVER_ORIGIN === "string"
        ? process.env.SERVER_ORIGIN.trim().replace(/\/$/, "")
        : "") || "http://localhost:5000";
    return { url: `${origin}/uploads/${filename}`, publicId: filename, storage: "local" };
  }

  const dataUri = bufferToDataUri(buffer, mimetype);

  const res = await client.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    resource_type: resourceType || "auto",
    overwrite: true
  });

  return { url: res.secure_url, publicId: res.public_id, storage: "cloudinary" };
};
