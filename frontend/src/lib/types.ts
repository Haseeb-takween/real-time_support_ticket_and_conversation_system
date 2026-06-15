export type TicketCategory = "Technical" | "Billing" | "Account" | "General";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
}

export interface Ticket {
  _id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string | AdminUser;
  assignedTo: string | AdminUser | null;
  seenByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  ticket: string;
  sender: { _id: string; email: string; role: "user" | "admin" } | string;
  body: string;
  createdAt: string;
}
