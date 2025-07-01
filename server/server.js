import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
//dotenv config
dotenv.config({
  path: "./.env",
});
const app = express();
const server = http.createServer(app);

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  pingTimeout: 10000,
  pingInterval: 5000,
});
// Online users
export const socketToUserMap = {};

// Socket.io connection handling
const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    setTimeout(() => {
      console.log("User disconnected:", userId);

      if (userId && userSocketMap[userId]) {
        userSocketMap[userId].delete(socket.id);

        if (userSocketMap[userId].size === 0) {
          delete userSocketMap[userId];
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    }, 1000);
  });
});

app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

// Importing routes
import userRouter from "./router/user.router.js";
import messageRouter from "./router/message.router.js";

// Using routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/status", (req, res) => res.send("Server is live"));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    data: null,
  });
});

// Database connection
await connectDB();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));
}

export default server;
