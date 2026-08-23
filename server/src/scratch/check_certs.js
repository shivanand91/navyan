import "../config/env.js";
import { connectDB } from "../config/db.js";
import { Certificate } from "../models/Certificate.js";

async function main() {
  await connectDB();
  const count = await Certificate.countDocuments();
  console.log("Certificate count:", count);
  const sample = await Certificate.find().limit(3).populate("internship");
  console.log("Sample certificates:", sample);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
