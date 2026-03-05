import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "Starting at $299/mo",
    tagline: "Best for solo owner-operators",
    bestFor: "Best for: one owner handling most calls and day-to-day operations.",
    boundaries: ["Includes 1 location", "Up to 150 calls/mo and 3 posts/week"],
    features: [
      "AI receptionist coverage for core business hours",
      "Lead capture with name, service need, and callback preference",
      "Basic call summaries delivered after each lead",
      "Simple FAQ handling based on your business details",
      "Monthly performance review and tune-up",
    ],
  },
  {
    name: "Growth",
    price: "Starting at $599/mo",
    tagline: "Best for busy shops",
    bestFor: "Best for: teams getting frequent calls and needing tighter follow-up.",
    boundaries: ["Includes 1 location", "Up to 400 calls/mo and 5 posts/week"],
    features: [
      "Everything in Starter",
      "Extended coverage windows for higher call volume",
      "Structured lead qualification for faster callbacks",
      "Social post drafting queue for consistent weekly content",
      "Priority optimization updates as patterns change",
      "Weekly review notes to improve conversion flow",
    ],
  },
  {
    name: "Website",
    price: "Starting at $499",
    tagline: "A clean, fast website that makes you look legit and gets you calls.",
    bestFor: "Best for: businesses that need a strong online presence and lead flow.",
    boundaries: ["Project scope and timeline set before kickoff", "Hosting and updates can be added as needed"],
    features: [
      "Mobile-friendly, black-and-gold design",
      "Contact form that emails you leads",
      "Book-a-demo / booking page setup",
      "Basic SEO setup (titles, metadata, indexing-ready)",
      "Fast hosting + analytics ready",
    ],
  },
];

const includedInEveryPlan = [
  "Initial setup and business context onboarding",
  "Direct support for updates to FAQs, hours, and service details",
  "Clear visibility into captured leads and activity",
  "Practical recommendations to improve performance over time",
];

const faqs = [
  {
    q: "Do I have to approve posts?",
    a: "No. You can run with approvals on or off depending on how hands-on you want to be.",
  },
  {
    q: "What happens if the AI can’t answer a question?",
    a: "It captures the lead details and routes the request to you for follow-up.",
  },
  {
    q: "How long does setup take?",
    a: "Most setups are completed in about 1 to 3 days depending on scope.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Plans are month-to-month unless we agree on a custom term.",
  },
  {
    q: "Do you support my industry?",
    a: "If you run a service-based business, we can usually adapt the workflow to your operation.",
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6 md:p-8">
        <p className="text-xs uppercase tracking-wide text-neutral-400">Pricing</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl">
          Choose the plan that fits your current stage.
        </h1>
        <p className="mt-4 max-w-3xl text-neutral-300">
          Start lean, then scale when volume grows. Every plan is built to help you capture more leads without adding
          unnecessary overhead.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier, index) => {
          const isMiddle = index === 1;

          return (
            <article
              key={tier.name}
              className={`rounded-xl border p-5 sm:p-6 ${
                isMiddle
                  ? "border-amber-400 bg-neutral-950 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                  : "border-neutral-800 bg-neutral-900/40"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-neutral-400">{tier.tagline}</p>
              <h2 className="mt-2 text-2xl font-semibold">{tier.name}</h2>
              <p className="mt-3 text-xl font-semibold text-amber-300">{tier.price}</p>

              <ul className="mt-5 space-y-2 text-sm text-neutral-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-amber-400">●</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-sm text-neutral-400">{tier.bestFor}</p>
              <div className="mt-3 text-sm text-neutral-400">
                <p className="font-semibold text-amber-300">Boundaries</p>
                {tier.boundaries.map((item) => (
                  <p key={item} className="mt-1 flex items-start gap-2">
                    <span className="mt-0.5 text-amber-400">●</span>
                    <span>{item}</span>
                  </p>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href="/book"
                  className={`inline-flex rounded-md px-5 py-3 text-sm font-semibold transition-colors ${
                    isMiddle
                      ? "bg-amber-400 text-neutral-950 hover:bg-amber-300"
                      : "border border-neutral-700 text-neutral-100 hover:border-neutral-600"
                  }`}
                >
                  {tier.name === "Website" ? "Get a Website" : "Book a Demo"}
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-amber-300">How pricing works</h2>
        <ul className="mt-5 space-y-3">
          <li className="flex items-start gap-2 text-sm text-neutral-300">
            <span className="mt-0.5 text-amber-400">●</span>
            <span>
              Starting at means final price depends on number of locations, call volume, and posting frequency.
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm text-neutral-300">
            <span className="mt-0.5 text-amber-400">●</span>
            <span>Setup usually takes 1–3 days after we collect business details.</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-neutral-300">
            <span className="mt-0.5 text-amber-400">●</span>
            <span>If it’s not a fit, you can cancel anytime (no long contracts).</span>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl font-semibold">What’s included in every plan</h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {includedInEveryPlan.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-neutral-300">
              <span className="mt-0.5 text-amber-400">●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6 md:p-8">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-5 space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <h3 className="text-sm font-semibold text-neutral-200">{item.q}</h3>
              <p className="mt-2 text-sm text-neutral-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
