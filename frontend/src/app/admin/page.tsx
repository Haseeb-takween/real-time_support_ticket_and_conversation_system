"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { AdminUser, Ticket, TicketPriority, TicketStatus } from "@/lib/types";

const STATUSES: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];
const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High"];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sort, setSort] = useState<"createdAt_desc" | "createdAt_asc">("createdAt_desc");
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    if (search) params.set("search", search);
    params.set("sort", sort);

    const { tickets } = await apiFetch<{ tickets: Ticket[] }>(`/tickets/admin?${params}`);
    setTickets(tickets);
  }, [statusFilter, priorityFilter, sort, search]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    apiFetch<{ admins: AdminUser[] }>("/auth/admins").then(({ admins }) => setAdmins(admins));
  }, [user]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setTicketsLoading(true);
      fetchTickets().finally(() => setTicketsLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [fetchTickets]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    const handleCreated = (ticket: Ticket) => {
      setTickets((prev) => [ticket, ...prev]);
    };

    const handleStatusUpdated = ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: TicketStatus;
    }) => {
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? { ...t, status } : t)));
    };

    const handleAssigned = ({
      ticketId,
      assignedTo,
    }: {
      ticketId: string;
      assignedTo: AdminUser | null;
    }) => {
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? { ...t, assignedTo } : t)));
    };

    socket.on("ticket:created", handleCreated);
    socket.on("ticket:status_updated", handleStatusUpdated);
    socket.on("ticket:assigned", handleAssigned);

    return () => {
      socket.off("ticket:created", handleCreated);
      socket.off("ticket:status_updated", handleStatusUpdated);
      socket.off("ticket:assigned", handleAssigned);
    };
  }, [user]);

  if (loading || !user || user.role !== "admin") {
    return <div className="flex flex-1 items-center justify-center">Loading...</div>;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    setTickets((prev) => prev.map((t) => (t._id === ticketId ? { ...t, status } : t)));
    await apiFetch<{ ticket: Ticket }>(`/tickets/${ticketId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  };

  const handleAssignChange = async (ticketId: string, assignedTo: string) => {
    const assignedAdmin = admins.find((a) => a._id === assignedTo) ?? null;
    setTickets((prev) =>
      prev.map((t) => (t._id === ticketId ? { ...t, assignedTo: assignedAdmin } : t)),
    );
    await apiFetch<{ ticket: Ticket }>(`/tickets/${ticketId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assignedTo: assignedTo || null }),
    });
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] px-8 py-4 dark:border-white/[.145]">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">Admin Dashboard</h1>
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
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
            All Tickets
          </h2>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search subject or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:text-zinc-50"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "createdAt_desc" | "createdAt_asc")}
              className="rounded border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="createdAt_desc">Newest first</option>
              <option value="createdAt_asc">Oldest first</option>
            </select>
          </div>

          {ticketsLoading ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No tickets found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-black/[.08] bg-white dark:border-white/[.145] dark:bg-zinc-950">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[.08] text-xs uppercase text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Requester</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const requester =
                      typeof ticket.createdBy === "string" ? null : ticket.createdBy;
                    const assigned =
                      typeof ticket.assignedTo === "string" || ticket.assignedTo === null
                        ? null
                        : ticket.assignedTo;

                    return (
                      <tr
                        key={ticket._id}
                        className="border-b border-black/[.05] last:border-0 dark:border-white/[.08]"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/tickets/${ticket._id}`}
                            className="font-medium text-black hover:underline dark:text-zinc-50"
                          >
                            {ticket.subject}
                          </Link>
                          {!ticket.seenByAdmin && (
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                              New
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {requester?.name ?? "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {ticket.category}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {ticket.priority}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={ticket.status}
                            onChange={(e) =>
                              handleStatusChange(ticket._id, e.target.value as TicketStatus)
                            }
                            className="rounded border border-black/[.08] bg-white px-2 py-1 text-xs text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <div className="mt-1">
                            <StatusBadge status={ticket.status} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={assigned?._id ?? ""}
                            onChange={(e) => handleAssignChange(ticket._id, e.target.value)}
                            className="rounded border border-black/[.08] bg-white px-2 py-1 text-xs text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50"
                          >
                            <option value="">Unassigned</option>
                            {admins.map((admin) => (
                              <option key={admin._id} value={admin._id}>
                                {admin.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
