import Notification from '../models/Notification.js';

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { recipient, title, message, type = 'info', metadata } = req.body;
    if (!recipient || !title || !message) return res.status(400).json({ message: 'recipient, title and message are required' });
    const n = await Notification.create({ recipient, title, message, type, metadata });
    res.status(201).json({ notification: n });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.recipient.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Forbidden' });
    notification.readAt = new Date();
    await notification.save();
    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

export default { listNotifications, createNotification, markAsRead };