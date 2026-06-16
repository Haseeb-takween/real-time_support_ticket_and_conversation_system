import type http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import type { AuthPayload } from "../middleware/auth.js";

export let io: Server;

export const initSocket = (server: http.Server): void => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const authToken =
      typeof socket.handshake.auth.token === "string" ? socket.handshake.auth.token : undefined;

    const cookieHeader = socket.handshake.headers.cookie ?? "";
    const cookieToken = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("token="))
      ?.slice("token=".length);

    const token = authToken ?? cookieToken;

    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      socket.data.user = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as AuthPayload;

    if (user.role === "admin") {
      socket.join("admins");
    }
    socket.join(`user:${user.id}`);

    socket.on("join_ticket", (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
    });

    socket.on("leave_ticket", (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
    });
  });
};
