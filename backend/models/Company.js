import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    location: { type: String },
    logo: { type: String },
    website: { type: String },
    industry: { type: String },
    verified: { type: Boolean, default: false },
    employeesCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
