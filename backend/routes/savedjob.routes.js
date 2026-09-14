import express from 'express';
import { listSavedJobs, createSavedJob, removeSavedJob } from '../controllers/savedjob.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, listSavedJobs);
router.post('/', protect, createSavedJob);
router.delete('/:jobId', protect, removeSavedJob);

export default router;