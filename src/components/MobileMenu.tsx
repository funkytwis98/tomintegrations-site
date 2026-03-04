"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
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

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-800 bg-black/40 backdrop-blur transition-colors hover:bg-neutral-900/40 md:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-neutral-200">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-neutral-800 bg-black/95 backdrop-blur md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div role="menu" className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                      active
                        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
                        : "border-neutral-800 text-neutral-200 hover:bg-neutral-900/40"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
