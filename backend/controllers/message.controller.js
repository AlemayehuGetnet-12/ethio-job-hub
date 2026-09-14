import Message from "../models/Message.js";

export const listMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const message = await Message.create({ ...req.body, sender: req.user.id });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

export default { listMessages, createMessage };
