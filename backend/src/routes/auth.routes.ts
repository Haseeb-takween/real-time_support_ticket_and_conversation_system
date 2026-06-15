import { Router } from "express";
import { listAdmins, login, logout, me, register } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.get("/admins", requireAuth, requireRole("admin"), listAdmins);

export default authRouter;
