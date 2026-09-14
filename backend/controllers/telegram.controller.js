import TelegramSubscription from '../models/TelegramSubscription.js';
import { botInstance } from '../telegram/bot.js';
import PairingCode from '../models/PairingCode.js';
import crypto from 'crypto';

export const subscribe = async (req, res, next) => {
  try {
    const { chatId, keywords = [], locations = [], categories = [] } = req.body;
    if (!chatId) return res.status(400).json({ message: 'chatId is required' });

    const existing = await TelegramSubscription.findOne({ chatId });
    if (existing) {
      existing.keywords = Array.isArray(keywords) ? keywords : [keywords];
      existing.locations = Array.isArray(locations) ? locations : [locations];
      existing.categories = Array.isArray(categories) ? categories : [categories];
      existing.active = true;
      await existing.save();
      return res.json({ subscription: existing });
    }

    const sub = await TelegramSubscription.create({ user: req.user?.id, chatId, keywords, locations, categories });
    res.status(201).json({ subscription: sub });
  } catch (err) {
    next(err);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ message: 'chatId is required' });
    const sub = await TelegramSubscription.findOneAndUpdate({ chatId }, { active: false }, { new: true });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ subscription: sub });
  } catch (err) {
    next(err);
  }
};

export const listSubscriptions = async (req, res, next) => {
  try {
    const subs = await TelegramSubscription.find(req.user ? { user: req.user.id } : {}).sort({ createdAt: -1 });
    res.json({ subscriptions: subs });
  } catch (err) {
    next(err);
  }
};

export const generatePairCode = async (req, res, next) => {
  try {
    // protected route: req.user must exist
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    // create a short code (8 hex chars)
    const code = crypto.randomBytes(4).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const pc = await PairingCode.create({ user: userId, code, expiresAt, used: false });

    // provide a deep link (using bot username if configured)
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '';
    const deepLink = botUsername ? `https://t.me/${botUsername}?start=link_${code}` : null;

    res.json({ code, expiresAt, deepLink });
  } catch (err) {
    next(err);
  }
};

export default { subscribe, unsubscribe, listSubscriptions, generatePairCode };
