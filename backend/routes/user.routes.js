import express from "express";
import { getProfile, updateProfile, listUsers } from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.get("/", protect, authorizeRoles("admin"), listUsers);
router.get("/:id", protect, getProfile);

export default router;
