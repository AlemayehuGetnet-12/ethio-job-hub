import express from 'express';
import { employerAnalytics } from '../controllers/analytics.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/employer', protect, authorizeRoles('employer','admin'), employerAnalytics);

export default router;