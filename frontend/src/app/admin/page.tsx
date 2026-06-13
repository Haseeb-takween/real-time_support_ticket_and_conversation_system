"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

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
      <main className="flex flex-1 items-center justify-center px-8 py-16 text-zinc-600 dark:text-zinc-400">
        Ticket management coming soon.
      </main>
    </div>
  );
}
