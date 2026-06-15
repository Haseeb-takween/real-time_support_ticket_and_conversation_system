import mongoose from "mongoose";

export interface IMessage {
  ticket: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  body: string;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Message =
  mongoose.models.Message ?? mongoose.model<IMessage>("Message", messageSchema);
