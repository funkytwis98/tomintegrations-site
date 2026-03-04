import Link from "next/link";
import HeroBackgroundCanvas from "@/src/components/HeroBackgroundCanvas";
import HeroDemoPanel from "@/src/components/HeroDemoPanel";

export default function Home() {
  return (
    <main className="space-y-12 sm:space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 sm:p-8">
        <HeroBackgroundCanvas />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
          <p className="inline-block max-w-full rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs leading-relaxed text-neutral-300">
            Built for small businesses who want more calls, more bookings, and more trust.
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Stop missing customers.
            <span className="text-amber-400"> Let AI handle the front desk and the posting.</span>
          </h1>

          <p className="mt-5 text-neutral-300">
            Tom Agency gives you an AI Receptionist that answers, qualifies, and books.
            Plus an AI Social Media Manager that keeps your business looking active and professional.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-amber-300 transition-colors"
            >
              Book a Demo
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-neutral-800 px-5 py-3 text-sm font-semibold text-neutral-100 hover:border-neutral-700 transition-colors"
            >
              View Pricing
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
            <span>24/7 coverage</span>
            <span>Human approval options</span>
            <span>Built for local service businesses</span>
          </div>
          </div>

          {/* HERO VISUAL */}
          <HeroDemoPanel />
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "AI Receptionist",
            body: "Answers calls fast, handles FAQs, captures lead info, and routes the right jobs to you.",
            href: "/receptionist",
          },
          {
            title: "AI Social Media Manager",
            body: "Writes on-brand posts, keeps you consistent, and helps you look legit to new customers.",
            href: "/social",
          },
          {
            title: "Combined Package",
            body: "One system for calls + content. Best for shops that want growth without hiring staff.",
            href: "/bundle",
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 hover:border-neutral-700 transition-colors"
          >
            <h3 className="text-lg font-semibold">
              <span className="text-amber-400">●</span> {card.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-300">{card.body}</p>
            <p className="mt-4 text-sm font-semibold text-amber-300">Learn more →</p>
          </Link>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">How it works</h2>
            <p className="mt-2 text-neutral-300">
              Simple setup. Clear control. Real results. You stay in charge.
            </p>
          </div>
          <div className="text-sm text-neutral-400">
            Typical setup: <span className="text-amber-300 font-semibold">1 to 3 days</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-xs text-neutral-400">Step 1</p>
            <h3 className="mt-2 text-lg font-semibold">
              <span className="text-amber-400">Connect</span> your business
            </h3>
            <p className="mt-2 text-sm text-neutral-300">
              We connect your phone, Facebook page, and your business details (hours, services, FAQs, pricing rules).
              Then we set the exact lead flow you want.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-xs text-neutral-400">Step 2</p>
            <h3 className="mt-2 text-lg font-semibold">
              AI <span className="text-amber-400">handles</span> the work
            </h3>
            <p className="mt-2 text-sm text-neutral-300">
              Calls and messages get handled fast. The AI collects name, need, vehicle/service info, and preferred
              time, then sends you the lead and next step.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-xs text-neutral-400">Step 3</p>
            <h3 className="mt-2 text-lg font-semibold">
              You <span className="text-amber-400">approve</span> and grow
            </h3>
            <p className="mt-2 text-sm text-neutral-300">
              You stay in control. You can approve posts before they publish and review leads as they come in. We
              track what’s working and improve weekly.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-5">
          <h4 className="font-semibold text-neutral-300">Where leads go</h4>
          <div className="mt-4 flex flex-col gap-3 text-sm text-neutral-400 md:flex-row md:items-center md:gap-6">
            <p className="flex items-center gap-2">
              <span className="text-amber-400">●</span>
              SMS alerts
            </p>
            <p className="flex items-center gap-2">
              <span className="text-amber-400">●</span>
              Email summary
            </p>
            <p className="flex items-center gap-2">
              <span className="text-amber-400">●</span>
              Dashboard log
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm text-neutral-300">
            Want to see this on your business in 10 minutes?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-amber-300 transition-colors"
            >
              Book a Demo
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-neutral-800 px-5 py-2.5 text-sm font-semibold text-neutral-100 hover:border-neutral-700 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">First case study: Interstate Tires</h2>
            <p className="mt-2 text-neutral-300">
              We’re using Interstate Tires as the first real-world rollout to prove the system, tighten the workflow,
              and build a repeatable playbook.
            </p>
          </div>
          <Link
            href="/case-studies/interstate-tires"
            className="rounded-md border border-neutral-800 px-5 py-3 text-sm font-semibold text-neutral-100 hover:border-neutral-700 transition-colors"
          >
            View Case Study
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-center sm:p-10">
        <h2 className="text-3xl font-semibold">Want to see it working on your business?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-300">
          Book a demo and we’ll show you exactly how the receptionist handles calls and how the social manager produces posts.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/book"
            className="rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-amber-300 transition-colors"
          >
            Book a Demo
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-neutral-800 px-6 py-3 text-sm font-semibold text-neutral-100 hover:border-neutral-700 transition-colors"
          >
            Contact
          </Link>
        </div>
      </section>
    </main>
  );
}
