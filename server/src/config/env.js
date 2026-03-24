import dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const CURRENT_FILE_PATH = fileURLToPath(import.meta.url);
const CURRENT_DIR = path.dirname(CURRENT_FILE_PATH);
const SERVER_ROOT = path.resolve(CURRENT_DIR, "../..");

const ENV_PATHS = [
  path.join(SERVER_ROOT, ".env"),
  path.join(SERVER_ROOT, ".env.local"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), "server/.env.local")
];

for (const envPath of [...new Set(ENV_PATHS)]) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}
