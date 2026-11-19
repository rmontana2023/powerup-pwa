"use client";
import { isAppOnline, OFFLINE_TEST_BYPASS } from "@/lib/connectivity";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { claimPromoDay, hasSeenPromoDay } from "@/lib/promo-frequency";
import { CustomerPromo, PromoResponse, safePromoLink } from "@/lib/promo-rules";

type DisplayPromo = CustomerPromo & { artwork: string; deadline: number };

export default function PromoPopup() {
  const [display, setDisplay] = useState<DisplayPromo | null>(null);
  const current = useRef<DisplayPromo | null>(null);

  function close() {
    if (current.current) URL.revokeObjectURL(current.current.artwork);
    current.current = null;
    setDisplay(null);
  }

  useEffect(() => {
    let disposed = false;
    let pending = false;
    let controller: AbortController | undefined;

    async function checkPromo() {
      if (
        disposed ||
        pending ||
        current.current ||
        !isAppOnline() ||
        document.visibilityState !== "visible"
      )
        return;
      // Do not compete with an update, QR, or installation dialog.
      if (document.querySelector('[role="dialog"], [aria-modal="true"], .swal2-container')) return;
      pending = true;
      controller = new AbortController();
      const request = controller;
      const timeout = window.setTimeout(() => request.abort(), 10_000);
      let artwork: string | null = null;
      try {
        const started = performance.now();
        const response = await fetch("/api/promos/active", {
          cache: "no-store",
          signal: request.signal,
        });
        if (!response.ok) return;
        const data: PromoResponse = await response.json();
        if (
          !data.promo ||
          !/^\d{4}-\d{2}-\d{2}$/.test(data.dayKey) ||
          (await hasSeenPromoDay(data.promo.id, data.dayKey))
        )
          return;
        const duration = Date.parse(data.validUntil) - Date.parse(data.serverTime);
        if (!Number.isFinite(duration) || duration <= 0) return;
        const deadline = started + duration;
        // Only load our authenticated image API, even if the response is malformed.
        if (!/^\/api\/promos\/[a-f\d]{24}\/image\?v=/i.test(data.promo.imageUrl)) return;
        const imageResponse = await fetch(data.promo.imageUrl, {
          cache: "no-store",
          signal: request.signal,
        });
        if (!imageResponse.ok) return;
        const blob = await imageResponse.blob();
        if (
          !blob.size ||
          blob.size > 2 * 1024 * 1024 ||
          !["image/png", "image/jpeg", "image/webp"].includes(blob.type)
        )
          return;
        artwork = URL.createObjectURL(blob);
        const image = new Image();
        image.src = artwork;
        await image.decode();
        if (
          disposed ||
          request.signal.aborted ||
          !isAppOnline() ||
          document.visibilityState !== "visible" ||
          performance.now() >= deadline
        )
          return;
        if (document.querySelector('[role="dialog"], [aria-modal="true"], .swal2-container'))
          return;
        if (!(await claimPromoDay(data.promo.id, data.dayKey))) return;
        if (disposed || request.signal.aborted || performance.now() >= deadline) return;
        const promo = { ...data.promo, link: safePromoLink(data.promo.link), artwork, deadline };
        current.current = promo;
        artwork = null;
        setDisplay(promo);
      } catch {
        // Offline, image, API or browser-storage failures never block the dashboard.
      } finally {
        if (artwork) URL.revokeObjectURL(artwork);
        window.clearTimeout(timeout);
        pending = false;
      }
    }

    void checkPromo();
    const scheduleTimer = window.setInterval(checkPromo, 30_000);
    window.addEventListener("online", checkPromo);
    window.addEventListener("focus", checkPromo);
    document.addEventListener("visibilitychange", checkPromo);
    return () => {
      disposed = true;
      window.clearInterval(scheduleTimer);
      controller?.abort();
      window.removeEventListener("online", checkPromo);
      window.removeEventListener("focus", checkPromo);
      document.removeEventListener("visibilitychange", checkPromo);
      if (current.current) URL.revokeObjectURL(current.current.artwork);
      current.current = null;
    };
  }, []);

  useEffect(() => {
    if (!display) return;
    const timer = window.setTimeout(close, Math.max(0, display.deadline - performance.now()));
    if (!OFFLINE_TEST_BYPASS) window.addEventListener("offline", close);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("offline", close);
    };
  }, [display]);

  return (
    <Dialog open={!!display} onClose={close} className="relative z-[10000]">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
        {display && (
          <DialogPanel className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#111] text-white shadow-2xl">
            <button
              type="button"
              data-autofocus
              aria-label="Close promotion"
              onClick={close}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/75 text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
            >
              <X size={22} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element -- Authenticated artwork is decoded before display and served via a blob URL. */}
            <img
              src={display.artwork}
              alt={display.title}
              className="max-h-[60dvh] w-full bg-black object-contain"
              onError={close}
            />
            <div className="space-y-4 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
                PowerUp promotion
              </p>
              <DialogTitle className="break-words text-xl font-bold sm:text-2xl">
                {display.title}
              </DialogTitle>
              {display.rewardId && /^[a-f\d]{24}$/i.test(display.rewardId) && (
                <a
                  href={`/rewards?reward=${display.rewardId}#rewards`}
                  onClick={close}
                  className="block rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-black"
                >
                  View reward
                </a>
              )}
              {display.link && (
                <a
                  href={display.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="block rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
                >
                  Learn more
                </a>
              )}
              <button
                type="button"
                onClick={close}
                className="w-full rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-orange-400"
              >
                Continue to dashboard
              </button>
            </div>
          </DialogPanel>
        )}
      </div>
    </Dialog>
  );
}
