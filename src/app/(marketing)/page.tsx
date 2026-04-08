"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Nav ────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-white text-sm tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          Tom Integrations
        </Link>
        <Link
          href="/book"
          className="text-white text-sm px-5 py-2 rounded-[980px] border border-white/25 hover:bg-white/10 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, background: "rgba(255,255,255,0.08)" }}
        >
          Book a call
        </Link>
      </div>
    </nav>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden" style={{ background: "#000" }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.45 }}
        src="/videos/home-demo.mp4?v=20cfa3e"
      />
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="fade-up text-sm uppercase tracking-[0.2em] mb-6" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
          AI for small business
        </p>
        <h1 className="fade-up text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] mb-6">
          Never miss
          <br />
          another call.
        </h1>
        <p className="fade-up text-lg sm:text-xl max-w-xl mx-auto mb-10" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>
          Your AI receptionist answers every call, captures every lead, and
          books the job — so you don&apos;t have to.
        </p>
        <div className="fade-up">
          <Link
            href="/book"
            className="inline-block bg-white text-[#111] text-base px-8 py-3.5 rounded-[980px] hover:bg-white/90 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          >
            Book a call with Tom
          </Link>
          <p className="text-sm mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Free 10-minute demo. No commitment.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Problem ────────────────────────────────────────────────────────── */
function Problem() {
  return (
    <section className="py-24 sm:py-32" style={{ background: "#f5f5f7" }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="fade-up text-7xl sm:text-[120px] leading-none text-[#1d1d1f] mb-4">
          62%
        </p>
        <p className="fade-up text-2xl sm:text-3xl text-[#1d1d1f] mb-6" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          of callers won&apos;t leave a voicemail.
        </p>
        <p className="fade-up text-lg leading-relaxed max-w-xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif", color: "#86868b" }}>
          You&apos;re on the job site. On another line. Meanwhile, new customers
          call, hang up, and call your competitor. Every missed call is money
          you&apos;ll never see.
        </p>
      </div>
    </section>
  );
}

/* ── Services ───────────────────────────────────────────────────────── */
interface ServiceRowProps {
  title: string;
  price: string;
  description: string;
  videoSrc: string;
  reverse?: boolean;
}

function ServiceRow({ title, price, description, videoSrc, reverse }: ServiceRowProps) {
  return (
    <div className={`fade-up grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center ${reverse ? "md:[direction:rtl]" : ""}`}>
      <div className={reverse ? "md:[direction:ltr]" : ""}>
        <p className="text-sm uppercase tracking-wider mb-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: "#86868b" }}>
          {price}
        </p>
        <h3 className="text-3xl sm:text-4xl text-[#1d1d1f] mb-4">{title}</h3>
        <p className="text-lg leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", color: "#86868b" }}>
          {description}
        </p>
      </div>
      <div className={reverse ? "md:[direction:ltr]" : ""}>
        <div className="rounded-[20px] overflow-hidden" style={{ background: "#000", boxShadow: "0 20px 60px -12px rgba(0,0,0,0.25)" }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full block"
            src={videoSrc}
          />
        </div>
      </div>
    </div>
  );
}

function Services() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="fade-up text-4xl sm:text-5xl text-[#1d1d1f] mb-4">
            One system. Every lead captured.
          </h2>
          <p className="fade-up text-lg" style={{ fontFamily: "'DM Sans', sans-serif", color: "#86868b" }}>
            Simple tools that work while you work.
          </p>
        </div>
        <div className="space-y-24 sm:space-y-32">
          <ServiceRow
            title="AI Receptionist"
            price="$99 / mo"
            description="Your phone is always answered. The AI greets callers, answers questions about your business, books appointments, and sends you a summary — all in a natural, human-like voice."
            videoSrc="/videos/ai-receptionist.mp4"
          />
          <ServiceRow
            title="Social Media Manager"
            price="$99 / mo"
            description="Consistent, on-brand content posted to your accounts every week. We handle the strategy, writing, and scheduling so your business stays visible without you lifting a finger."
            videoSrc="/videos/ai-social.mp4"
            reverse
          />
          <ServiceRow
            title="The Complete Package"
            price="$169 / mo"
            description="AI receptionist plus social media management bundled together. Every call answered, every post published — one simple bill."
            videoSrc="/videos/combined-package.mp4"
          />
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ───────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Tell us about your business",
      desc: "A quick call so we understand your services, hours, and how you want calls handled.",
    },
    {
      num: "02",
      title: "We set up your AI",
      desc: "We configure your receptionist, train it on your business, and test everything.",
    },
    {
      num: "03",
      title: "You grow",
      desc: "Calls get answered, leads get captured, and you focus on what you do best.",
    },
  ];

  return (
    <section className="py-24 sm:py-32" style={{ background: "#f5f5f7" }}>
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="fade-up text-4xl sm:text-5xl text-[#1d1d1f] text-center mb-16">
          Up and running in days.
        </h2>
        <div className="fade-up grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.num} className="text-center md:text-left">
              <p className="text-5xl mb-4" style={{ color: "#d2d2d7" }}>
                {step.num}
              </p>
              <h3 className="text-2xl text-[#1d1d1f] mb-3">{step.title}</h3>
              <p className="text-base leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", color: "#86868b" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ────────────────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: "Receptionist",
      price: "$99",
      period: "/mo",
      features: [
        "AI answers every call",
        "Appointment booking",
        "Lead capture & summaries",
        "Custom greeting & FAQs",
      ],
      featured: false,
    },
    {
      name: "Complete",
      price: "$169",
      period: "/mo",
      features: [
        "Everything in Receptionist",
        "Weekly social media posts",
        "Content strategy",
        "Multi-platform publishing",
      ],
      featured: true,
    },
    {
      name: "Website",
      price: "$499",
      period: " one-time + $19/mo",
      features: [
        "Custom designed website",
        "Mobile responsive",
        "SEO optimized",
        "Hosting & maintenance",
      ],
      featured: false,
    },
  ];

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="fade-up text-4xl sm:text-5xl text-[#1d1d1f] mb-4">
            Simple pricing.
          </h2>
          <p className="fade-up text-lg" style={{ fontFamily: "'DM Sans', sans-serif", color: "#86868b" }}>
            No contracts. Cancel anytime.
          </p>
        </div>
        <div className="fade-up grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-8"
              style={{
                background: plan.featured ? "#1d1d1f" : "#f5f5f7",
                color: plan.featured ? "#fff" : "#1d1d1f",
              }}
            >
              <p
                className="text-sm uppercase tracking-wider mb-4"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  color: plan.featured ? "rgba(255,255,255,0.5)" : "#86868b",
                }}
              >
                {plan.name}
              </p>
              <p className="text-4xl mb-1">
                {plan.price}
                <span
                  className="text-base"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: plan.featured ? "rgba(255,255,255,0.4)" : "#86868b",
                  }}
                >
                  {plan.period}
                </span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="text-sm"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: plan.featured ? "rgba(255,255,255,0.6)" : "#86868b",
                    }}
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/book"
                className="mt-8 block text-center text-sm py-3 rounded-[980px] transition-colors"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  background: plan.featured ? "#fff" : "#1d1d1f",
                  color: plan.featured ? "#1d1d1f" : "#fff",
                }}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
        <p className="fade-up text-center text-sm mt-10" style={{ fontFamily: "'DM Sans', sans-serif", color: "#86868b" }}>
          All plans include setup, onboarding, and ongoing support.
        </p>
      </div>
    </section>
  );
}

/* ── Final CTA ──────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="py-24 sm:py-32" style={{ background: "#111" }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="fade-up text-4xl sm:text-5xl text-white mb-4">
          Ready to stop
          <br />
          missing calls?
        </h2>
        <p className="fade-up text-lg mb-10" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)" }}>
          See it working on your business in 10 minutes.
        </p>
        <div className="fade-up">
          <Link
            href="/book"
            className="inline-block bg-white text-[#111] text-base px-8 py-3.5 rounded-[980px] hover:bg-white/90 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          >
            Book a call with Tom
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer className="py-8" style={{ background: "#111", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.25)" }}>
          &copy; 2026 Tom Integrations. Chattanooga, TN.
        </p>
      </div>
    </footer>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function Home() {
  const wrapperRef = useScrollReveal();

  return (
    <div ref={wrapperRef}>
      <Nav />
      <Hero />
      <Problem />
      <Services />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}
