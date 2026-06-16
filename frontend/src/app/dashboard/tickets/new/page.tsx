"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Ticket, TicketCategory, TicketPriority } from "@/lib/types";

const CATEGORIES: TicketCategory[] = ["Technical", "Billing", "Account", "General"];
const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High"];

export default function NewTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("General");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch<{ ticket: Ticket }>("/tickets", {
        method: "POST",
        body: JSON.stringify({ subject, description, category, priority }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-lg border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950"
      >
        <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
          New Ticket
        </h1>

        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Subject
        </label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mb-4 w-full rounded border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:text-zinc-50"
        />

        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-4 w-full rounded border border-black/[.08] bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:text-zinc-50"
        />

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full rounded border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full rounded border border-black/[.08] bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex-1 rounded-full border border-black/[.08] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {submitting ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
