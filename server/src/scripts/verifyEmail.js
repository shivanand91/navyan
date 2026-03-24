import "dotenv/config";

import { verifyEmailTransport } from "../services/emailService.js";

const result = await verifyEmailTransport();

if (!result.ok) {
  console.error(`Email verification failed: ${result.reason}`);
  process.exit(1);
}

console.log("Email transport verified successfully.");
