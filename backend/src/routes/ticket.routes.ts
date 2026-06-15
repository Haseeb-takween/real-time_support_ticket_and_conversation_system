import { Router } from "express";
import {
  assignTicket,
  createMessage,
  createTicket,
  getTicket,
  listAllTickets,
  listMessages,
  listTickets,
  markTicketSeen,
  updateTicketStatus,
} from "../controllers/ticket.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const ticketRouter = Router();

ticketRouter.use(requireAuth);

ticketRouter.get("/admin", requireRole("admin"), listAllTickets);

ticketRouter.get("/", listTickets);
ticketRouter.post("/", createTicket);
ticketRouter.get("/:id", getTicket);
ticketRouter.get("/:id/messages", listMessages);
ticketRouter.post("/:id/messages", createMessage);
ticketRouter.patch("/:id/status", requireRole("admin"), updateTicketStatus);
ticketRouter.patch("/:id/assign", requireRole("admin"), assignTicket);
ticketRouter.patch("/:id/seen", requireRole("admin"), markTicketSeen);

export default ticketRouter;
