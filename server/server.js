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
console.log("frontend : ", process.env.CORS_ORIGIN);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));
app.use(cookieParser());

// Socket.io setup
export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  pingTimeout: 25000,
  pingInterval: 10000,
});
// Online users
export const userSocketMap = {};

// Socket.io connection handling
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId, socket.id);

  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    setTimeout(() => {
      if (userId && userSocketMap[userId]) {
        userSocketMap[userId].delete(socket.id);
        if (userSocketMap[userId].size === 0) delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
      console.log("Socket disconnected:", userId, socket.id);
    }, 1000);
  });
});

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

// this is for vercel

// if (process.env.NODE_ENV !== "production") {
//   const PORT = process.env.PORT || 5000;
//   server.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));
// }

// export default server;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
