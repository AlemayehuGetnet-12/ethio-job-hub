import express from "express";
import { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword, telegramAuth } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
// Telegram login: accepts the Telegram widget payload (client-side) and verifies server-side
router.post('/telegram', telegramAuth);

export default router;
