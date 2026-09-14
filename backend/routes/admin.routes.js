import express from 'express';
import { getStats, listUsers, updateUser, deleteUser, listAllJobs } from '../controllers/admin.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/jobs', listAllJobs);

export default router;
