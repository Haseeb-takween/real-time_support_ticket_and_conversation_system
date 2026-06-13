import mongoose from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

export const User = mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
