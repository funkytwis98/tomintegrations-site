"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

const links = [
  { href: "", label: "Overview", icon: "📊" },
  { href: "/agent", label: "Voice Agent", icon: "🤖" },
  { href: "/leads", label: "Leads", icon: "👤" },
  { href: "/calls", label: "Calls", icon: "📞" },
  { href: "/knowledge", label: "Knowledge Base", icon: "📚" },
  { href: "/learn", label: "Teach Sarah", icon: "🎓" },
  { href: "/playbook", label: "Sales Playbook", icon: "📋" },
];

export default function Sidebar({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const base = `/clients/${clientId}`;
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    supabase
      .from("unanswered_questions")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .eq("status", "pending")
      .then(({ count }) => setPendingCount(count ?? 0));
  }, [clientId]);

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-800 bg-neutral-950 p-4">
      <Link href="/" className="mb-6 block text-lg font-semibold">
        <span className="text-neutral-100">Tom</span>
        <span className="text-amber-400"> Agency</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const full = base + link.href;
          const active =
            link.href === ""
              ? pathname === base
              : pathname.startsWith(full);

          return (
            <Link
              key={link.href}
              href={full}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-amber-400/10 text-amber-400 font-medium"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
              {link.href === "/learn" && pendingCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
