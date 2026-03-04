"use client";

import Image from "next/image";
import { useState } from "react";
import DemoVideoModal from "@/src/components/DemoVideoModal";

export default function HeroDemoPanel() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDemoOpen(true)}
        aria-label="Play demo video"
        className="group relative block min-h-11 w-full max-w-full cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-3 text-left shadow-sm"
      >
        <Image
          src="/hero-mock.svg"
          alt="Tom Agency AI Receptionist dashboard mockup with call handling and booking workflow"
          width={1280}
          height={900}
          priority
          className="h-auto w-full rounded-xl"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/25 opacity-100 transition group-hover:bg-black/35">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/70 bg-amber-400/20 text-amber-200">
            ▶
          </span>
        </div>
      </button>
      <DemoVideoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
