import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db.js";
import { upsertAdminAccount } from "../services/adminSeedService.js";

await connectDB();
const { user, created } = await upsertAdminAccount();
console.log(
  created ? "Admin created in database:" : "Admin updated in database:",
  user.email
);
process.exit(0);
