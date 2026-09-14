import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    coverLetter: { type: String },
    resumeUrl: { type: String },
    status: { type: String, enum: ["submitted", "reviewing", "shortlisted", "interview", "hired", "rejected", "withdrawn"], default: "submitted" },
    withdrawnAt: { type: Date },
    // interview subdocument stores scheduling details and invitedBy (user id)
    interview: {
      date: { type: Date },
      location: { type: String },
      mode: { type: String }, // e.g., 'online', 'in-person', 'phone'
      notes: { type: String },
      invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
