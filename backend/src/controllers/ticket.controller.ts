import type { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { Message } from "../models/message.model.js";
import { Ticket } from "../models/ticket.model.js";

const createTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["Technical", "Billing", "Account", "General"]),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
});

const createMessageSchema = z.object({
  body: z.string().min(1),
});

const getOwnedTicket = async (id: string, userId: string) => {
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }
  if (ticket.createdBy.toString() !== userId) {
    throw new AppError(403, "Forbidden");
  }
  return ticket;
};

export const listTickets = async (req: Request, res: Response): Promise<void> => {
  const tickets = await Ticket.find({ createdBy: req.user!.id }).sort({ createdAt: -1 });
  res.json({ tickets });
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  const data = createTicketSchema.parse(req.body);

  const ticket = await Ticket.create({
    ...data,
    status: "Open",
    createdBy: req.user!.id,
    assignedTo: null,
  });

  res.status(201).json({ ticket });
};

export const getTicket = async (req: Request, res: Response): Promise<void> => {
  const ticketId = req.params.id as string;
  const ticket = await getOwnedTicket(ticketId, req.user!.id);
  res.json({ ticket });
};

export const listMessages = async (req: Request, res: Response): Promise<void> => {
  const ticketId = req.params.id as string;
  await getOwnedTicket(ticketId, req.user!.id);

  const messages = await Message.find({ ticket: ticketId })
    .sort({ createdAt: 1 })
    .populate("sender", "name email role");

  res.json({ messages });
};

export const createMessage = async (req: Request, res: Response): Promise<void> => {
  const ticketId = req.params.id as string;
  await getOwnedTicket(ticketId, req.user!.id);
  const { body } = createMessageSchema.parse(req.body);

  const message = await Message.create({
    ticket: ticketId,
    sender: req.user!.id,
    body,
  });

  await message.populate("sender", "name email role");

  res.status(201).json({ message });
};
