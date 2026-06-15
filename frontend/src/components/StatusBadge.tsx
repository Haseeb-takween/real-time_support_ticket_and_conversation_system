import type { TicketStatus } from "@/lib/types";

const STATUS_STYLES: Record<TicketStatus, string> = {
  Open: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  Resolved: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  Closed: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
