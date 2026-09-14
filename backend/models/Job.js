import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number },
    salaryCurrency: { type: String, default: "ETB" },
    type: { type: String, enum: ["full-time", "part-time", "contract", "internship"], default: "full-time" },
    category: { type: String },
    skills: [{ type: String }],
    isRemote: { type: Boolean, default: false },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
