import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
