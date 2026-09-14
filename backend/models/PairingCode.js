import mongoose from 'mongoose';

const pairingCodeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  code: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  usedAt: { type: Date },
  linkedChatId: { type: String },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const PairingCode = mongoose.model('PairingCode', pairingCodeSchema);
export default PairingCode;
