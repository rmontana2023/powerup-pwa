"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import SplashScreen from "./SplashScreen";
import InstallPWAButton from "./InstallPWAButton";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const stretchRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------
   * FIXED iOS Pull-To-Refresh (Overlay Only — UI Not Moved)
   * ------------------------------------------------------- */
  useEffect(() => {
    let startY = 0;
    let pulling = false;
    let pullDistance = 0;

    const maxStretch = 140;
    const triggerPoint = 90;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        pulling = true;
        startY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling) return;

      const currentY = e.touches[0].clientY;
      pullDistance = currentY - startY;

      if (pullDistance > 0) {
        const stretch = Math.min(pullDistance, maxStretch);

        // Stretch the overlay only
        if (stretchRef.current) {
          stretchRef.current.style.height = `${stretch}px`;
        }

        // Update indicator
        if (indicatorRef.current) {
          indicatorRef.current.style.opacity = `${Math.min(stretch / 60, 1)}`;
          indicatorRef.current.textContent =
            stretch > triggerPoint ? "Release to refresh…" : "Pull to refresh…";
        }
      }
    };

    const onTouchEnd = () => {
      if (!pulling) return;

      if (pullDistance > triggerPoint) {
        window.location.reload();
      }

      // Animate back
      if (stretchRef.current) {
        stretchRef.current.style.transition = "height 0.25s ease";
        stretchRef.current.style.height = "0px";
      }

      if (indicatorRef.current) {
        indicatorRef.current.style.transition = "opacity 0.25s ease";
        indicatorRef.current.style.opacity = "0";
      }

      setTimeout(() => {
        if (stretchRef.current) stretchRef.current.style.transition = "";
        if (indicatorRef.current) indicatorRef.current.style.transition = "";
      }, 300);

      pulling = false;
      pullDistance = 0;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  /* -------------------------------------------------------
   * Splash Logic (unchanged)
   * ------------------------------------------------------- */
  useEffect(() => {
    setShowSplash(true);
    setFadeOut(false);

    const timer = setTimeout(() => {
      setFadeOut(true);

      const removeTimer = setTimeout(() => setShowSplash(false), 700);

      return () => clearTimeout(removeTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Pull-to-refresh stretchy overlay (no UI movement) */}
      <div
        ref={stretchRef}
        className="w-full fixed top-0 left-0 bg-transparent z-[9998]"
        style={{ height: 0 }}
      ></div>

      {/* Indicator */}
      <div
        ref={indicatorRef}
        className="fixed top-6 left-1/2 -translate-x-1/2 text-gray-600 text-sm opacity-0 z-[9999] pointer-events-none"
      >
        Pull to refresh…
      </div>

      {/* Your actual UI (NOT moved) */}
      {showSplash && <SplashScreen fadeOut={fadeOut} />}
      {!showSplash && children}
      <InstallPWAButton />
    </>
  );
}
