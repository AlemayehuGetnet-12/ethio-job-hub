import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "info" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    readAt: { type: Date },
    metadata: { type: Object },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
