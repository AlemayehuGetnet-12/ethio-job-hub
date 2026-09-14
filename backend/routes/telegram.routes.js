import express from 'express';
import { subscribe, unsubscribe, listSubscriptions, generatePairCode } from '../controllers/telegram.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// subscribe - optional auth but prefer authenticated users
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.get('/list', protect, listSubscriptions);

// pairing: generate a one-time code that the user will send to the bot
router.post('/pair/generate', protect, generatePairCode);

export default router;
