import type { Request, Response } from "express";
import { getDBHealth } from "../lib/db.js";

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const db = await getDBHealth();
  const isHealthy = db.status === "ok" || db.status === "not_configured";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db,
  });
};
