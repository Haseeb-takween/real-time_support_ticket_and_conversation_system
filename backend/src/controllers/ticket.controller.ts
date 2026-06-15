import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { io } from "../lib/socket.js";
import { AppError } from "../middleware/errorHandler.js";
import { Message } from "../models/message.model.js";
import { Ticket } from "../models/ticket.model.js";
import { User } from "../models/user.model.js";

const createTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["Technical", "Billing", "Account", "General"]),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
});

const createMessageSchema = z.object({
  body: z.string().min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"]),
});

const assignTicketSchema = z.object({
  assignedTo: z.string().nullable(),
});

const getAccessibleTicket = async (id: string, userId: string, role: string) => {
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }
  if (role !== "admin" && ticket.createdBy.toString() !== userId) {
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

  await ticket.populate("createdBy", "name email");
  io.to("admins").emit("ticket:created", ticket);

  res.status(201).json({ ticket });
};

export const getTicket = async (req: Request, res: Response): Promise<void> => {
  const ticketId = req.params.id as string;
  await getAccessibleTicket(ticketId, req.user!.id, req.user!.role);

  const ticket = await Ticket.findById(ticketId)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  res.json({ ticket });
};

export const listMessages = async (req: Request, res: Response): Promise<void> => {
  const ticketId = req.params.id as string;
  await getAccessibleTicket(ticketId, req.user!.id, req.user!.role);

  const messages = await Message.find({ ticket: ticketId })
    .sort({ createdAt: 1 })
    .populate("sender", "name email role");

  res.json({ messages });
};

export const createMessage = async (req: Request, res: Response): Promise<void> => {
  const ticketId = req.params.id as string;
  await getAccessibleTicket(ticketId, req.user!.id, req.user!.role);
  const { body } = createMessageSchema.parse(req.body);

  const message = await Message.create({
    ticket: ticketId,
    sender: req.user!.id,
    body,
  });

  await message.populate("sender", "name email role");

  io.to(`ticket:${ticketId}`).emit("message:new", message);

  res.status(201).json({ message });
};

export const listAllTickets = async (req: Request, res: Response): Promise<void> => {
  const { status, priority, search, sort } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { subject: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sortOrder = sort === "createdAt_asc" ? 1 : -1;

  const tickets = await Ticket.find(filter)
    .sort({ createdAt: sortOrder })
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  res.json({ tickets });
};

export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
  const { status } = updateStatusSchema.parse(req.body);

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  ticket.status = status;
  await ticket.save();

  io.to("admins")
    .to(`user:${ticket.createdBy}`)
    .to(`ticket:${ticket._id}`)
    .emit("ticket:status_updated", { ticketId: ticket._id.toString(), status: ticket.status });

  res.json({ ticket });
};

export const assignTicket = async (req: Request, res: Response): Promise<void> => {
  const { assignedTo } = assignTicketSchema.parse(req.body);

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  if (assignedTo) {
    const admin = await User.findOne({ _id: assignedTo, role: "admin" });
    if (!admin) {
      throw new AppError(400, "Invalid admin user");
    }
  }

  ticket.assignedTo = assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null;
  await ticket.save();
  await ticket.populate("assignedTo", "name email");

  io.to("admins").emit("ticket:assigned", {
    ticketId: ticket._id.toString(),
    assignedTo: ticket.assignedTo,
  });

  res.json({ ticket });
};

export const markTicketSeen = async (req: Request, res: Response): Promise<void> => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  ticket.seenByAdmin = true;
  await ticket.save();

  res.json({ ticket });
};
