import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { User } from "../models/user.model.js";

const COOKIE_NAME = "token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signToken = (user: { id: string; email: string; role: string }) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );

const toPublicUser = (user: { id: string; name: string; email: string; role: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role: "user" });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(201).json({ user: toPublicUser(user), token });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({ user: toPublicUser(user), token });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, path: "/" });
  res.status(204).send();
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({ user: toPublicUser(user), token });
};

export const listAdmins = async (_req: Request, res: Response): Promise<void> => {
  const admins = await User.find({ role: "admin" }).select("name email");
  res.json({ admins });
};
