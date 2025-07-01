import {
  login,
  signup,
  logout,
  refreshAccessToken,
  updateProfile,
  checkAuth,
  searchUsers,
} from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-token", refreshAccessToken);
router.patch("/update-profile", verifyJWT, updateProfile);
router.get("/check", verifyJWT, checkAuth);
router.get("/search", verifyJWT, searchUsers);
export default router;
