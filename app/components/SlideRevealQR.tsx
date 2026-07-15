"use client";
import React, { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

interface SlideToRevealQRProps {
  user: {
    name?: string;
    firstName?: string;
    lastName?: string;
    qrCode?: string;
    _id?: string;
  };
  offlineMode?: boolean;
  lastSync?: string;
  autoOpen?: boolean;
}

export default function SlideToRevealQR({
  user,
  offlineMode,
  lastSync,
  autoOpen,
}: SlideToRevealQRProps) {
  console.log("SlideToRevealQR props:", { user, offlineMode, lastSync, autoOpen });
  const [showSlide, setShowSlide] = useState(autoOpen);
  const [revealed, setRevealed] = useState(false);
  const [redeemTimer, setRedeemTimer] = useState(0);
  const [progress, setProgress] = useState(0); // 0..100
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);


  useEffect(() => {
    if (autoOpen) {
      setShowSlide(true);
    }
  }, [autoOpen]);

  // countdown
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (revealed && redeemTimer > 0) {
      t = setInterval(() => setRedeemTimer((s) => s - 1), 1000);
    }
    if (redeemTimer === 0 && revealed) {
      setShowSlide(false);
      setRevealed(false);
    }
    return () => clearInterval(t);
  }, [revealed, redeemTimer]);

  // helper: set progress safely via rAF for smoothness
  const setProgressSafe = (v: number) => {
    const clamped = Math.min(100, Math.max(0, v));
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setProgress(clamped));
  };

  // compute progress from clientX
  const updateProgressFromClientX = (clientX: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const offset = clientX - rect.left;
    const p = (offset / rect.width) * 100;
    setProgressSafe(p);
  };

  // Pointer / touch handlers (covers desktop and modern mobile)
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const slider = sliderRef.current;
    if (!slider) return;
    draggingRef.current = true;
    pointerIdRef.current = e.pointerId;
    try {
      // Capture pointer so we receive move/up even if finger leaves element
      (slider as Element).setPointerCapture?.(e.pointerId);
    } catch {}
    updateProgressFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateProgressFromClientX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const slider = sliderRef.current;
    if (slider && pointerIdRef.current != null) {
      try {
        (slider as Element).releasePointerCapture?.(pointerIdRef.current);
      } catch {}
    }
    draggingRef.current = false;
    pointerIdRef.current = null;
    finalizeSlide();
  };

  // Fallback touch handlers for older browsers that don't use pointer events
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    const t = e.touches[0];
    updateProgressFromClientX(t.clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const t = e.touches[0];
    updateProgressFromClientX(t.clientX);
  };
  const onTouchEnd = () => {
    draggingRef.current = false;
    finalizeSlide();
  };

  // finalize: threshold 50% for easier UX
  const finalizeSlide = () => {
    if (progress >= 50) {
      // reveal
      setProgressSafe(100);
      setTimeout(() => setProgress(0), 300);
      setRevealed(true);
      setRedeemTimer(30);
    } else {
      // smooth reset
      setProgressSafe(0);
    }
  };

  // cleanup raf on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Floating QR Button */}
      <button
        onClick={() => {
          setShowSlide(true);
          setRevealed(false);
          setRedeemTimer(0);
          setProgress(0);
        }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-50 border-4 border-[var(--background)] transition"
        aria-label="Open QR"
      >
        <QRCodeSVG value={user?.qrCode || user?._id || "NO-QR"} size={32} />
      </button>

      {/* Fullscreen Slide-to-Reveal */}
      {showSlide && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)]"
          role="dialog"
          aria-modal="true"
        >
          {/* close */}
         {!offlineMode && (
            <button
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--foreground)] transition z-40"
              onClick={() => {
                setShowSlide(false);
                setRevealed(false);
                setRedeemTimer(0);
              }}
            >
              <X className="w-7 h-7" />
            </button>
          )}

          {/* name */}
          <h2 className="absolute top-8 text-2xl font-semibold text-[var(--accent)] z-40">
            {user?.firstName + " " + user?.lastName}
          </h2>

          {/* big QR background (slightly blurred until reveal) */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out pointer-events-none ${
                revealed ? "blur-0 opacity-100 bg-white" : "blur-md opacity-80"
              } ${offlineMode ? "-translate-y-16" : ""}`}
            >
            <QRCodeSVG
              value={user?.qrCode || user?._id || "NO-QR"}
              size={300}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>

          {/* slide control */}
          {!revealed && (
           <div className={`absolute w-[92%] max-w-lg px-4 z-50 ${
                offlineMode ? "bottom-52" : "bottom-24"
              }`}
            >
              <p className="text-[var(--foreground)] font-medium mb-3 text-center text-lg">
                Slide to reveal QR
              </p>

              <div
                ref={sliderRef}
                // important: prevent default touch gestures so slider captures moves
                style={{ touchAction: "none" }}
                className="relative h-14 bg-[var(--card-bg)] rounded-full overflow-hidden select-none cursor-pointer border border-[var(--border-color)]"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* progress bar */}
                <div
                  className="absolute left-0 top-0 h-full bg-[var(--accent)] rounded-full transition-all duration-60 ease-out shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
                  style={{
                    width: `${progress}%`,
                    boxShadow: `0 6px 24px rgba(255,107,0,${Math.min(0.35, progress / 300)})`,
                  }}
                />

                {/* knob (visible and moves) */}
                <div
                  ref={knobRef}
                  className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--background)] border border-[var(--border-color)] flex items-center justify-center z-20"
                  style={{
                    left: `calc(${Math.max(2, progress)}% - 24px)`,
                    transition: draggingRef.current ? "none" : "left 200ms ease",
                  }}
                  aria-hidden
                >
                  <div className="w-4 h-4 rounded-full bg-[var(--accent)]" />
                </div>

                {/* label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[var(--foreground)] font-semibold">Slide →</span>
                </div>
              </div>
            </div>
          )}

          {/* revealed timer */}
          {revealed && !offlineMode && (
            <div className="absolute bottom-20 text-center z-50">
              <p className="text-5xl font-bold text-[var(--accent)]">
                {redeemTimer}s
              </p>

              <p className="text-sm text-[var(--text-muted)]">
                QR will close automatically
              </p>
            </div>
          )}
          {offlineMode && (
            <div className="absolute bottom-4 left-0 right-0 px-4 z-50">
              <div className="max-w-sm mx-auto rounded-xl border border-yellow-500 bg-yellow-500/10 backdrop-blur-md px-4 py-3 text-center">

                <h3 className="text-sm font-semibold text-yellow-400">
                  No Internet Connection
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-300">
                  You can still present your QR Code for scanning.
                  Rewards and transactions will sync once you're back online.
                </p>

                {lastSync && (
                  <p className="mt-2 text-[11px] leading-4 text-gray-500">
                    Last synced:
                    <br />
                    {new Date(lastSync).toLocaleString("en-PH")}
                  </p>
                )}

                <button
                 onClick={() => {
                    if (navigator.onLine) {
                      window.location.reload();
                    }
                  }}
                  className="mt-3 w-full rounded-lg bg-green-600 py-2 text-sm font-medium transition hover:bg-green-700"
                >
                  Refresh Connection
                </button>

              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}