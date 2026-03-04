"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function resetVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.currentTime = 0;
}

export default function DemoVideoModal() {
  const [open, setOpen] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const closeModal = () => {
    setOpen(false);
    resetVideo(videoRef.current);
  };

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <section className="mt-6 md:mt-10">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group block w-full text-left"
          aria-label="Play demo video"
        >
          <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
            <Image
              src="/demo-poster.jpg"
              alt="Demo preview for Tom Agency AI workflow"
              width={1280}
              height={720}
              className="h-auto w-full"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/70 bg-amber-400/20 text-amber-200 transition group-hover:bg-amber-400/30">
                ▶
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-neutral-100">Watch a 45s demo</h3>
              <p className="mt-1 text-sm text-neutral-300">
                See how calls are handled, leads are captured, and follow-ups are triggered.
              </p>
            </div>
            <span className="inline-flex min-h-11 items-center rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950">
              Play demo
            </span>
          </div>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
          role="presentation"
        >
          <div className="mx-auto flex min-h-full w-[min(92vw,56rem)] items-center justify-center py-6">
            <div
              className="relative w-full rounded-2xl border border-neutral-800 bg-black p-3"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Demo video modal"
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-700 bg-black/60 text-neutral-200 hover:bg-neutral-900"
              >
                ✕
              </button>

              <div className="pt-12">
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  preload="metadata"
                  poster="/demo-poster.jpg"
                  className="w-full rounded-xl"
                  onError={() => setVideoUnavailable(true)}
                >
                  <source src="/demo.mp4" type="video/mp4" />
                </video>
                {videoUnavailable && (
                  <p className="mt-3 text-sm text-neutral-300">Video coming soon. Check back shortly.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
