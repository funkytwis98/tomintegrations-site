"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        resize?: boolean;
      }) => void;
    };
  }
}

const calendlyUrl = "https://calendly.com/justinaron08/30min?hide_gdpr_banner=1";

export default function BookPage() {
  const embedRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const initCalendly = useCallback(() => {
    if (!embedRef.current || !window.Calendly) {
      return;
    }

    embedRef.current.innerHTML = "";
    window.Calendly.initInlineWidget({
      url: calendlyUrl,
      parentElement: embedRef.current,
      resize: true,
    });
  }, []);

  useEffect(() => {
    if (window.Calendly) {
      initCalendly();
    }
  }, [initCalendly, scriptReady]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Book a Demo</h1>
        <p className="mt-2 text-neutral-300">
          Pick a time. We’ll show you the AI Receptionist workflow and how the Social Manager drafts posts for approval.
        </p>
      </div>

      {/* quick qualifier */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
        <h2 className="text-lg font-semibold">Before you book</h2>
        <p className="mt-2 text-sm text-neutral-300">
          This helps us tailor the demo to your business.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs text-neutral-400">1</p>
            <p className="mt-1 text-sm text-neutral-200">What kind of business are you?</p>
            <p className="mt-1 text-xs text-neutral-500">Tire shop, cleaning, salon, clinic, etc.</p>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs text-neutral-400">2</p>
            <p className="mt-1 text-sm text-neutral-200">Where do leads come from today?</p>
            <p className="mt-1 text-xs text-neutral-500">Calls, Facebook, Google, walk-ins, referrals.</p>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs text-neutral-400">3</p>
            <p className="mt-1 text-sm text-neutral-200">What’s the biggest pain?</p>
            <p className="mt-1 text-xs text-neutral-500">Missed calls, no time, inconsistent posting.</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          We’ll ask these again on the call if needed. No pressure.
        </p>
      </div>

      {/* calendly */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />

        <div ref={embedRef} className="calendly-embed" />
      </div>
    </div>
  );
}
