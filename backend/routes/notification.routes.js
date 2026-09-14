import express from 'express';
import { listNotifications, createNotification, markAsRead } from '../controllers/notification.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, listNotifications);
router.post('/', protect, authorizeRoles('admin'), createNotification); // only admin can create arbitrary notifications
router.post('/:id/read', protect, markAsRead);

export default router;