import { Router } from "express";
import {
  createMessage,
  createTicket,
  getTicket,
  listMessages,
  listTickets,
} from "../controllers/ticket.controller.js";
import { requireAuth } from "../middleware/auth.js";

const ticketRouter = Router();

ticketRouter.use(requireAuth);

ticketRouter.get("/", listTickets);
ticketRouter.post("/", createTicket);
ticketRouter.get("/:id", getTicket);
ticketRouter.get("/:id/messages", listMessages);
ticketRouter.post("/:id/messages", createMessage);

export default ticketRouter;
