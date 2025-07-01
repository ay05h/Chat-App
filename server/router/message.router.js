import { Router } from "express";
import { verifyJWT } from ".././middlewares/auth.middleware.js";
import {
  getUsersForCurrentUser,
  getAllMessage,
  markMessageAsRead,
  sendMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.get("/users", verifyJWT, getUsersForCurrentUser);
router.get("/:userId", verifyJWT, getAllMessage);
router.put("/messages/:messageId/read", verifyJWT, markMessageAsRead);
router.post("/send/:userId", verifyJWT, sendMessage);
export default router;
