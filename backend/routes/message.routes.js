import express from "express";
import { listMessages, createMessage } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, listMessages);
router.post("/", protect, createMessage);

export default router;
