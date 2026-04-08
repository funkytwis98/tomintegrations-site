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
        <Link href="/book" className="pill pill-ghost !text-[13px] !py-2 !px-5">
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
    <section className="relative h-dvh flex items-center justify-center overflow-hidden bg-black">
      {/* Video layer */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        src="/videos/home-demo.mp4?v=20cfa3e"
      />
      {/* Cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 45%, transparent 0%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      {/* Bottom fade to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: "linear-gradient(to top, #000 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-[680px] mx-auto">
        <p className="fade-up text-[11px] uppercase tracking-[0.25em] text-white/40 mb-6 font-medium">
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
          <Link href="/book" className="pill pill-white">
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
        <p className="fade-up text-[clamp(4.5rem,15vw,9rem)] leading-[0.9] tracking-[-0.03em] text-[#1d1d1f]">
          62%
        </p>
        <p className="fade-up fade-up-delay-1 text-[22px] sm:text-[28px] text-[#1d1d1f] font-medium mt-3 mb-8">
          of callers won&rsquo;t leave a voicemail.
        </p>
        <p className="fade-up fade-up-delay-2 text-[17px] leading-[1.65] text-[#86868b] max-w-[520px] mx-auto">
          You&rsquo;re on the job site. On another line. Meanwhile, new customers
          call, hang up, and call your competitor. Every missed call is money
          you&rsquo;ll never see.
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
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#86868b] font-medium mb-3">
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

/* ═══════════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════════ */
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
    <section className="py-28 sm:py-40 bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-6">
        <h2 className="fade-up text-[clamp(2rem,5vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] text-center mb-20">
          Up and running in days.
        </h2>
        <div className="fade-up grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <div key={step.num} className={`text-center md:text-left fade-up fade-up-delay-${i + 1}`}>
              <p className="text-[64px] leading-none tracking-[-0.04em] text-[#d2d2d7] mb-5">
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
              className="rounded-[20px] p-8 sm:p-9 flex flex-col transition-transform duration-300 hover:-translate-y-1"
              style={{
                background: plan.featured ? "#1d1d1f" : "#f5f5f7",
                color: plan.featured ? "#fff" : "#1d1d1f",
                boxShadow: plan.featured
                  ? "0 32px 80px -16px rgba(0,0,0,0.35)"
                  : "none",
              }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.2em] font-medium mb-5"
                style={{ color: plan.featured ? "rgba(255,255,255,0.45)" : "#86868b" }}
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
              <ul className="mt-8 space-y-3.5 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="text-[14px] leading-snug"
                    style={{ color: plan.featured ? "rgba(255,255,255,0.55)" : "#86868b" }}
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/book"
                className={`pill mt-9 text-center !text-[14px] !py-3 ${
                  plan.featured ? "pill-white" : "pill-dark"
                }`}
              >
                Get started
              </Link>
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
          <Link href="/book" className="pill pill-white">
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
