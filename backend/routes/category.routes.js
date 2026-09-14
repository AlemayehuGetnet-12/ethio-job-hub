import express from "express";
import { listCategories, createCategory } from "../controllers/category.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listCategories);
router.post("/", protect, authorizeRoles("admin"), createCategory);

export default router;
