"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/receptionist", label: "Receptionist" },
  { href: "/social", label: "Social" },
  { href: "/bundle", label: "Bundle" },
  { href: "/pricing", label: "Pricing" },
  { href: "/case-studies/interstate-tires", label: "Case Study" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function TopTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-neutral-800 bg-black/40 backdrop-blur md:hidden">
      <div className="mx-auto max-w-6xl">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 py-2">
          {tabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`snap-start shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                  active
                    ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
                    : "border-neutral-800 text-neutral-200 hover:bg-neutral-900/40"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
