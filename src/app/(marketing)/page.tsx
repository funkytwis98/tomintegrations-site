"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ── Scroll reveal hook ─────────────────────────────────────────────── */
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
      { threshold: 0.1 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ═══════════════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════════════ */
function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      <div className="max-w-[980px] mx-auto px-6 h-12 flex items-center justify-between">
        <Link href="/" className="text-white/90 text-[13px] tracking-tight font-medium">
          Tom Integrations
        </Link>
        <Link href="/book" className="pill pill-ghost-gold !text-[13px] !py-2 !px-5">
          Book a call
        </Link>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative h-dvh flex items-center justify-center overflow-hidden bg-[#111]">
      {/* Subtle gold glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(197,160,78,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-[680px] mx-auto">
        <p className="fade-up text-[11px] uppercase tracking-[0.25em] text-[#C5A04E] mb-6 font-medium">
          AI for small business
        </p>
        <h1 className="fade-up fade-up-delay-1 text-[clamp(2.8rem,8vw,5.5rem)] text-white leading-[1.02] tracking-[-0.02em] mb-7">
          Never miss
          <br />
          another call.
        </h1>
        <p className="fade-up fade-up-delay-2 text-[17px] sm:text-[19px] leading-relaxed text-white/50 max-w-[480px] mx-auto mb-12">
          Your AI receptionist answers every call, captures every lead, and
          books the job&nbsp;&mdash; so you don&rsquo;t have to.
        </p>
        <div className="fade-up fade-up-delay-3">
          <Link href="/book" className="pill pill-gold">
            Book a call with Tom
          </Link>
          <p className="text-[13px] text-white/25 mt-5 tracking-wide">
            Free 10-minute demo. No commitment.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PROBLEM
   ═══════════════════════════════════════════════════════════════════════ */
function Problem() {
  return (
    <section className="py-28 sm:py-40 bg-[#f5f5f7]">
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <p className="fade-up text-[clamp(4.5rem,15vw,9rem)] leading-[0.9] tracking-[-0.03em] text-[#C5A04E]">
          62%
        </p>
        <p className="fade-up fade-up-delay-1 text-[22px] sm:text-[28px] text-[#1d1d1f] font-medium mt-3 mb-8">
          of callers won&rsquo;t leave a voicemail.
        </p>
        <p className="fade-up fade-up-delay-2 text-[17px] leading-[1.65] text-[#86868b] max-w-[520px] mx-auto">
          They hang up. They call your competitor. Every missed call is money you&rsquo;ll never see.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SERVICES
   ═══════════════════════════════════════════════════════════════════════ */
function ServiceRow({
  title,
  price,
  description,
  videoSrc,
  reverse,
}: {
  title: string;
  price: string;
  description: string;
  videoSrc: string;
  reverse?: boolean;
}) {
  return (
    <div className="fade-up grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
      <div className={reverse ? "md:order-2" : ""}>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A04E] font-medium mb-3">
          {price}
        </p>
        <h3 className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.015em] text-[#1d1d1f] mb-5">
          {title}
        </h3>
        <p className="text-[17px] leading-[1.65] text-[#86868b]">
          {description}
        </p>
      </div>
      <div className={reverse ? "md:order-1" : ""}>
        <div
          className="rounded-[24px] overflow-hidden bg-black"
          style={{ boxShadow: "0 24px 80px -16px rgba(0,0,0,0.2)" }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
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
    <section className="py-28 sm:py-40 bg-white">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="text-center mb-24 sm:mb-32">
          <h2 className="fade-up text-[clamp(2rem,5vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] mb-4">
            One system. Every lead captured.
          </h2>
          <p className="fade-up fade-up-delay-1 text-[17px] text-[#86868b]">
            Simple tools that work while you work.
          </p>
        </div>
        <div className="space-y-28 sm:space-y-40">
          <ServiceRow
            title="AI Receptionist"
            price="$99 / mo"
            description="Answers calls 24/7, captures lead info, and texts you instantly. No more missed jobs."
            videoSrc="/videos/ai-receptionist.mp4"
          />
          <ServiceRow
            title="Social Media Manager"
            price="$99 / mo"
            description="On-brand posts every week that keep you visible to new customers searching for you."
            videoSrc="/videos/ai-social.mp4"
            reverse
          />
          <ServiceRow
            title="The Complete Package"
            price="$169 / mo"
            description="Receptionist + social. Every call answered, every post published, one simple bill."
            videoSrc="/videos/combined-package.mp4"
          />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Tell us about your business",
      desc: "Hours, services, how you want leads.",
    },
    {
      num: "02",
      title: "We set up your AI",
      desc: "Starts answering calls and capturing leads.",
    },
    {
      num: "03",
      title: "You grow",
      desc: "Focus on the work that matters.",
    },
  ];

  return (
    <section className="py-28 sm:py-40 bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-6">
        <h2 className="fade-up text-[clamp(2rem,5vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] text-center mb-20">
          Up and running in days.
        </h2>
        <div className="fade-up grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <div key={step.num} className={`text-center md:text-left fade-up fade-up-delay-${i + 1}`}>
              <p className="text-[64px] leading-none tracking-[-0.04em] mb-5" style={{ color: "rgba(197,160,78,0.4)" }}>
                {step.num}
              </p>
              <h3 className="text-[22px] leading-[1.2] text-[#1d1d1f] mb-3">
                {step.title}
              </h3>
              <p className="text-[15px] leading-[1.6] text-[#86868b]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════════ */
function Pricing() {
  const plans = [
    {
      name: "Receptionist",
      price: "$99",
      period: "/mo",
      desc: "AI answers every call and texts you the lead.",
      featured: false,
    },
    {
      name: "Complete",
      price: "$169",
      period: "/mo",
      desc: "Receptionist + weekly social media posts.",
      featured: true,
    },
    {
      name: "Website",
      price: "$499",
      period: " one-time + $19/mo",
      desc: "Custom site, mobile-ready, SEO optimized.",
      featured: false,
    },
  ];

  return (
    <section className="py-28 sm:py-40 bg-white">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="fade-up text-[clamp(2rem,5vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] mb-4">
            Simple pricing.
          </h2>
          <p className="fade-up fade-up-delay-1 text-[17px] text-[#86868b]">
            No contracts. Cancel anytime.
          </p>
        </div>
        <div className="fade-up grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[860px] mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-[20px] p-8 sm:p-9 transition-transform duration-300 hover:-translate-y-1"
              style={{
                background: plan.featured ? "#1d1d1f" : "#f5f5f7",
                color: plan.featured ? "#fff" : "#1d1d1f",
                border: plan.featured ? "1px solid rgba(197,160,78,0.4)" : "none",
                boxShadow: plan.featured
                  ? "0 32px 80px -16px rgba(0,0,0,0.35)"
                  : "none",
              }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.2em] font-medium mb-5"
                style={{ color: plan.featured ? "#C5A04E" : "#86868b" }}
              >
                {plan.name}
              </p>
              <p className="text-[44px] leading-none tracking-[-0.02em] mb-1">
                {plan.price}
                <span
                  className="text-[15px] tracking-normal"
                  style={{ color: plan.featured ? "rgba(255,255,255,0.35)" : "#86868b" }}
                >
                  {plan.period}
                </span>
              </p>
              <p
                className="text-[14px] leading-snug mt-5"
                style={{ color: plan.featured ? "rgba(255,255,255,0.5)" : "#86868b" }}
              >
                {plan.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="fade-up text-center text-[14px] text-[#86868b] mt-12">
          All plans include setup, onboarding, and ongoing support.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-32 sm:py-44 bg-[#111]">
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <h2 className="fade-up text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.08] tracking-[-0.02em] text-white mb-5">
          Ready to stop
          <br />
          missing calls?
        </h2>
        <p className="fade-up fade-up-delay-1 text-[17px] text-white/35 mb-12">
          See it working on your business in 10 minutes.
        </p>
        <div className="fade-up fade-up-delay-2">
          <Link href="/book" className="pill pill-gold">
            Book a call with Tom
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════ */
function SiteFooter() {
  return (
    <footer
      className="py-7 bg-[#111]"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-[980px] mx-auto px-6 text-center">
        <p className="text-[12px] text-white/20 tracking-wide">
          &copy; 2026 Tom Integrations. Chattanooga, TN.
        </p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
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
