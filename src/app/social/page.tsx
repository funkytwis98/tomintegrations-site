import Link from "next/link";

const deliverables = [
  "4-12 posts per month drafted in your brand voice",
  "Service highlights, trust builders, and offers",
  "Optional approvals before anything goes live",
  "Simple content calendar with posting cadence",
];

export default function SocialPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6 md:p-8">
        <p className="text-xs uppercase tracking-wide text-neutral-400">AI Social Media Manager</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl">
          Stay active online without doing all the posting yourself.
        </h1>
        <p className="mt-4 max-w-3xl text-neutral-300">
          We help you maintain a consistent, professional presence with AI-assisted content tailored for local service businesses.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {deliverables.map((item) => (
          <div key={item} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
            <p className="text-sm text-neutral-200">{item}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-center sm:p-8">
        <h2 className="text-2xl font-semibold">Want your content handled consistently?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-300">
          We’ll show you how drafts, approvals, and posting cadence work for your business.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/book"
            className="rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
          >
            Book a Demo
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-neutral-800 px-5 py-3 text-sm font-semibold text-neutral-100 transition-colors hover:border-neutral-700"
          >
            View Pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
