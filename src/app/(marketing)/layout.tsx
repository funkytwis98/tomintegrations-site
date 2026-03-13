import Link from "next/link";
import MobileMenu from "@/src/components/MobileMenu";

const nav = [
  { href: "/receptionist", label: "AI Receptionist" },
  { href: "/social", label: "AI Social Media Manager" },
  { href: "/bundle", label: "Combined Package" },
  { href: "/pricing", label: "Pricing" },
  { href: "/case-studies/interstate-tires", label: "Case Study" },
  { href: "/book", label: "Book a Demo" },
  { href: "/contact", label: "Contact" },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur relative">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            <span className="text-neutral-100">Tom</span>
            <span className="text-amber-400"> Agency</span>
          </Link>

          <nav className="hidden gap-6 text-sm text-neutral-300 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-amber-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <MobileMenu />
            <Link
              href="/book"
              aria-label="Book a Demo"
              className="whitespace-nowrap rounded-md bg-amber-400 px-2.5 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-amber-300 sm:px-4 sm:text-sm"
            >
              <span aria-hidden="true" className="inline-block max-w-[40vw] truncate align-bottom sm:hidden">Book</span>
              <span aria-hidden="true" className="hidden sm:inline">Book a Demo</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>

      <footer className="border-t border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-400 sm:px-6">
          © {new Date().getFullYear()} Tom Agency. All rights reserved.
        </div>
      </footer>
    </>
  );
}
