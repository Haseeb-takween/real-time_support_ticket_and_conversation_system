import mongoose from "mongoose";

export type TicketCategory = "Technical" | "Billing" | "Account" | "General";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface ITicket {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | null;
  seenByAdmin: boolean;
}

const ticketSchema = new mongoose.Schema<ITicket>(
  {
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Technical", "Billing", "Account", "General"],
      required: true,
    },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    seenByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Ticket = mongoose.models.Ticket ?? mongoose.model<ITicket>("Ticket", ticketSchema);
