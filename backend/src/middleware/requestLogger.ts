import type { Request } from "express";
import morgan from "morgan";
import { env } from "../config/env.js";

morgan.token("matched-route", (req: Request) => {
  if (req.route?.path) {
    const base = req.baseUrl ?? "";
    return `${base}${req.route.path}`;
  }
  return req.originalUrl ?? req.url ?? "-";
});

const devFormat =
  ":method :url → :status (:response-time ms) [route: :matched-route]";
const prodFormat = "combined";

export const requestLogger =
  env.NODE_ENV === "test"
    ? (_req: Request, _res: unknown, next: () => void) => next()
    : morgan(env.NODE_ENV === "development" ? devFormat : prodFormat, {
        stream: {
          write: (message) => {
            console.log(message.trim());
          },
        },
      });
