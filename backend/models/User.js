import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["jobseeker", "employer", "admin"], default: "jobseeker" },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    profileImage: { type: String },
    skills: [{ type: String }],
    cvUrl: { type: String },
    isActive: { type: Boolean, default: true },
    verifiedAt: { type: Date },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
