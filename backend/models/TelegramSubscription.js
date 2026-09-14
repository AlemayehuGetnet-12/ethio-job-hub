import mongoose from 'mongoose';

const telegramSubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chatId: { type: String, required: true },
    keywords: [{ type: String }],
    locations: [{ type: String }],
    categories: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TelegramSubscription = mongoose.model('TelegramSubscription', telegramSubscriptionSchema);
export default TelegramSubscription;
