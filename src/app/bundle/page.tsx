import Link from "next/link";

const points = [
  "One combined workflow for calls and content",
  "Lower cost than hiring separate staff",
  "Best fit for businesses that want growth with less overhead",
];

export default function BundlePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 md:p-8">
        <p className="text-xs uppercase tracking-wide text-neutral-400">Combined Package</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">AI Receptionist + AI Social Manager in one package.</h1>
        <p className="mt-4 max-w-3xl text-neutral-300">
          Capture more opportunities from inbound calls while building trust online with consistent social content.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {points.map((item) => (
          <div key={item} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
            <p className="text-sm text-neutral-200">{item}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center">
        <h2 className="text-2xl font-semibold">See the full combined workflow live.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-300">
          We’ll walk through call handling, lead capture, and social content output in one demo.
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
    </div>
  );
}
