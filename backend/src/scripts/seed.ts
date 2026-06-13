import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User, type UserRole } from "../models/user.model.js";

interface SeedAccount {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const accounts: SeedAccount[] = [
  {
    name: requireEnv("SEED_ADMIN1_NAME"),
    email: requireEnv("SEED_ADMIN1_EMAIL"),
    password: requireEnv("SEED_ADMIN1_PASSWORD"),
    role: "admin",
  },
  {
    name: requireEnv("SEED_ADMIN2_NAME"),
    email: requireEnv("SEED_ADMIN2_EMAIL"),
    password: requireEnv("SEED_ADMIN2_PASSWORD"),
    role: "admin",
  },
  {
    name: requireEnv("SEED_USER1_NAME"),
    email: requireEnv("SEED_USER1_EMAIL"),
    password: requireEnv("SEED_USER1_PASSWORD"),
    role: "user",
  },
  {
    name: requireEnv("SEED_USER2_NAME"),
    email: requireEnv("SEED_USER2_EMAIL"),
    password: requireEnv("SEED_USER2_PASSWORD"),
    role: "user",
  },
];

async function seed() {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  await mongoose.connect(env.mongodbUri);
  console.log("Connected to MongoDB");

  for (const account of accounts) {
    const hashedPassword = await bcrypt.hash(account.password, 10);
    await User.findOneAndUpdate(
      { email: account.email },
      { name: account.name, password: hashedPassword, role: account.role },
      { upsert: true, returnDocument: "after" },
    );
    console.log(`Seeded ${account.role}: ${account.email}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
