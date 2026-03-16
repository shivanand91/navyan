import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  let mongod;

  mongoose.set("strictQuery", true);

  try {
    if (!uri) throw new Error("MONGODB_URI not set");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (err) {
    if (process.env.NODE_ENV === "production") throw err;
    console.warn("MongoDB connect failed. Starting in-memory MongoDB for development.");
    mongod = await MongoMemoryServer.create({
      instance: {
        ip: "127.0.0.1",
        port: Number(process.env.MEMORY_MONGODB_PORT || 27018),
        portGeneration: false
      }
    });
    const memUri = mongod.getUri("navyan");
    await mongoose.connect(memUri);
    console.log("In-memory MongoDB connected");
  }

  if (mongod) {
    mongoose.connection.on("disconnected", async () => {
      await mongod.stop();
    });
  }
};
