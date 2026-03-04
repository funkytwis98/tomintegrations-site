"use client";

import { useEffect, useRef, useState } from "react";

function resetVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.currentTime = 0;
}

type DemoVideoModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function DemoVideoModal({ open, onClose }: DemoVideoModalProps) {
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const closeModal = () => {
    onClose();
    resetVideo(videoRef.current);
  };

  useEffect(() => {
    if (!open) {
      resetVideo(videoRef.current);
      return;
    }

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={closeModal} role="presentation">
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
            {videoUnavailable && <p className="mt-3 text-sm text-neutral-300">Video coming soon. Check back shortly.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
