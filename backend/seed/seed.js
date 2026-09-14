import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import User from "../models/User.js";

dotenv.config();

export const seed = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not configured, skipping seed data");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);

  await Category.deleteMany({});
  await User.deleteMany({ role: "admin" });

  await Category.create([
    { name: "Software Engineering", slug: "software-engineering", description: "Software and IT jobs" },
    { name: "Healthcare", slug: "healthcare", description: "Medical and health jobs" },
    { name: "Construction", slug: "construction", description: "Construction and field roles" },
  ]);

  await User.create({
    name: "Admin User",
    email: "admin@ethiojobs.com",
    password: "$2a$10$7k9JO7W7j5O6J3SHQ2YxquMZaK19Z6W9jjvMdQ2BqG0/t4Z6X3l0e",
    role: "admin",
    verifiedAt: new Date(),
  });

  console.log("Seed data completed");
  await mongoose.disconnect();
};

if (process.argv[1]?.includes("seed.js")) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default seed;
