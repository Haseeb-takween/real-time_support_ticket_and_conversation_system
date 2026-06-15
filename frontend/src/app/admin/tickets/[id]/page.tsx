"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Message, Ticket } from "@/lib/types";

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<{ ticket: Ticket }>(`/tickets/${params.id}`),
      apiFetch<{ messages: Message[] }>(`/tickets/${params.id}/messages`),
    ])
      .then(([ticketRes, messagesRes]) => {
        setTicket(ticketRes.ticket);
        setMessages(messagesRes.messages);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load ticket"))
      .finally(() => setLoading(false));

    apiFetch<{ ticket: Ticket }>(`/tickets/${params.id}/seen`, { method: "PATCH" }).catch(
      () => undefined,
    );
  }, [params.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    setSending(true);
    try {
      const { message } = await apiFetch<{ message: Message }>(`/tickets/${params.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: draft }),
      });
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center">Loading...</div>;
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
        <p>{error ?? "Ticket not found"}</p>
        <Link href="/admin" className="underline">
          Back to all tickets
        </Link>
      </div>
    );
  }

  const requester = typeof ticket.createdBy === "string" ? null : ticket.createdBy;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/[.08] px-8 py-4 dark:border-white/[.145]">
        <Link
          href="/admin"
          className="mb-2 inline-block text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          ← Back to all tickets
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
              {ticket.subject}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{ticket.description}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {ticket.category} &middot; {ticket.priority} priority &middot; Requested by{" "}
              {requester?.name ?? "Unknown"} ({requester?.email ?? "—"})
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            No messages yet. Send the first message below.
          </p>
        ) : (
          messages.map((message) => {
            const sender = typeof message.sender === "string" ? null : message.sender;
            const isAdmin = sender?.role === "admin";

            return (
              <div
                key={message._id}
                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-md rounded-lg px-4 py-2 text-sm ${
                    isAdmin
                      ? "bg-foreground text-background"
                      : "bg-white text-black dark:bg-zinc-800 dark:text-zinc-50"
                  }`}
                >
                  {message.body}
                </div>
                <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {sender?.email ?? "Unknown"} &middot;{" "}
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </main>

      <form
        onSubmit={handleSend}
        className="flex gap-3 border-t border-black/[.08] px-8 py-4 dark:border-white/[.145]"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a reply..."
          className="flex-1 rounded border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Send
        </button>
      </form>
    </div>
  );
}
