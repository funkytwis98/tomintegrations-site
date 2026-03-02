import Link from "next/link";

const highlights = [
  "Baseline audit of missed call patterns and response flow",
  "AI receptionist script tuned for tire and service inquiries",
  "Social posting cadence built around practical maintenance tips",
  "Tracking dashboard for leads captured and appointments booked",
];

export default function InterstateTiresCaseStudyPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 md:p-8">
        <p className="text-xs uppercase tracking-wide text-neutral-400">Case Study</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Interstate Tires: first real-world rollout.</h1>
        <p className="mt-4 max-w-3xl text-neutral-300">
          This project is our proving ground for repeatable AI receptionist + social workflows in local service operations.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {highlights.map((item) => (
          <div key={item} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
            <p className="text-sm text-neutral-200">{item}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 md:p-8">
        <h2 className="text-2xl font-semibold">Current status</h2>
        <p className="mt-3 text-neutral-300">
          Implementation is active. This page will be updated with concrete metrics like response speed, lead capture rate,
          and booked appointments as data comes in.
        </p>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center">
        <h2 className="text-2xl font-semibold">Want this system in your business?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-300">
          We can walk you through what rollout would look like for your team.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/book"
            className="rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
          >
            Book a Demo
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-neutral-800 px-5 py-3 text-sm font-semibold text-neutral-100 transition-colors hover:border-neutral-700"
          >
            Contact
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 md:p-8">
        <h2 className="text-2xl font-semibold">Examples</h2>
        <p className="mt-2 text-neutral-300">
          Realistic samples of what the system produces. Replace with real screenshots as we collect them.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h3 className="text-sm font-semibold text-amber-300">Call transcript (example)</h3>
            <div className="mt-3 border-l border-neutral-800 pl-4 text-sm">
              <p>
                <span className="text-amber-300">AI:</span>{" "}
                <span className="text-neutral-300">Thanks for calling Interstate Tires. What can we help with today?</span>
              </p>
              <p className="mt-2">
                <span className="text-neutral-200">Caller:</span>{" "}
                <span className="text-neutral-300">I need two front tires for a 2017 Camry.</span>
              </p>
              <p className="mt-2">
                <span className="text-amber-300">AI:</span>{" "}
                <span className="text-neutral-300">Got it. Do you know the tire size, or should we look it up by trim?</span>
              </p>
              <p className="mt-2">
                <span className="text-amber-300">AI:</span>{" "}
                <span className="text-neutral-300">Can I get your name and best callback number?</span>
              </p>
              <p className="mt-2">
                <span className="text-amber-300">AI:</span>{" "}
                <span className="text-neutral-300">Perfect. We’ll send next steps and available times shortly.</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h3 className="text-sm font-semibold text-amber-300">Lead notification (example)</h3>
            <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <p className="text-neutral-400">Name:</p>
              <p className="text-neutral-200">Jordan M.</p>
              <p className="text-neutral-400">Need:</p>
              <p className="text-neutral-200">2 front tire replacements</p>
              <p className="text-neutral-400">Vehicle:</p>
              <p className="text-neutral-200">2017 Toyota Camry</p>
              <p className="text-neutral-400">Tire size (if known):</p>
              <p className="text-neutral-200">Not confirmed</p>
              <p className="text-neutral-400">Preferred time:</p>
              <p className="text-neutral-200">Tomorrow after 2:00 PM</p>
              <p className="text-neutral-400">Notes:</p>
              <p className="text-neutral-200">Price-sensitive, asked about mid-range options</p>
              <p className="text-neutral-400">Next step:</p>
              <p className="text-neutral-200">Call back with 2 quote options and install slot</p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h3 className="text-sm font-semibold text-amber-300">Social post draft (example)</h3>
            <div className="mt-3 space-y-2 text-sm text-neutral-300">
              <p>
                Tire Tip Monday: Check your tread depth with a penny test. If you can see the top of Lincoln&apos;s head,
                your tires may be due for replacement.
              </p>
              <p>Road grip and braking can change fast as tread wears down.</p>
              <p className="mt-3 text-xs text-neutral-400">Platform: Facebook</p>
              <p className="text-xs text-neutral-400">Drafted for approval • scheduled</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center">
        <h2 className="text-2xl font-semibold">Want this for your business?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-300">
          We’ll show you the exact workflow and what it would look like for your shop.
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
