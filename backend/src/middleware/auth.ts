import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../models/user.model.js";
import { AppError } from "./errorHandler.js";

export interface AuthPayload {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    next(new AppError(401, "Not authenticated"));
    return;
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, "Forbidden"));
      return;
    }
    next();
  };
};
