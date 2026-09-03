import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { User } from "./models/User.js";

let io;

export const initializeSocketServer = (httpServer, cors) => {
  io = new Server(httpServer, { cors: { ...cors, methods: ["GET", "POST"] } });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("role").lean();
      if (user?.role !== "admin") return next(new Error("Admin access required"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => socket.join("admins"));
  return io;
};

export const emitAdminActivity = (activity) => {
  io?.to("admins").emit("admin:activity", activity);
};
