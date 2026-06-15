"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Ticket } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ tickets: Ticket[] }>("/tickets")
      .then(({ tickets }) => setTickets(tickets))
      .finally(() => setTicketsLoading(false));
  }, []);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center">Loading...</div>;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] px-8 py-4 dark:border-white/[.145]">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">My Tickets</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-black/[.08] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Tickets</h2>
            <Link
              href="/dashboard/tickets/new"
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              New Ticket
            </Link>
          </div>

          {ticketsLoading ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You haven&apos;t raised any tickets yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {tickets.map((ticket) => (
                <li key={ticket._id}>
                  <Link
                    href={`/dashboard/tickets/${ticket._id}`}
                    className="flex items-center justify-between rounded-lg border border-black/[.08] bg-white px-4 py-3 transition-colors hover:bg-black/[.02] dark:border-white/[.145] dark:bg-zinc-950 dark:hover:bg-[#1a1a1a]"
                  >
                    <div>
                      <p className="font-medium text-black dark:text-zinc-50">{ticket.subject}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {ticket.priority} priority &middot;{" "}
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
