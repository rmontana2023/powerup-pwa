"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(ua) &&
      !(window as any).MSStream;

    setIsIOS(ios);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (
      e: BeforeInstallPromptEvent
    ) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );
    };
  }, []);

  if (isInstalled) return null;

  const install = async () => {
    if (isIOS) {
      Swal.fire({
        title: "Install PowerUp",
        html: `
          <div style="text-align:left">
            <p>1. Tap the <b>Share</b> button.</p>
            <p>2. Scroll down.</p>
            <p>3. Tap <b>Add to Home Screen</b>.</p>
            <p>4. Tap <b>Add</b>.</p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Got it",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    if (!deferredPrompt) {
      Swal.fire({
        icon: "info",
        title: "Install unavailable",
        text: "Your browser doesn't support app installation yet or the install prompt isn't ready.",
        confirmButtonColor: "#f97316",
      });

      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  if (!isIOS && !deferredPrompt) return null;

  return (
    <button
      onClick={install}
      className="fixed bottom-6 right-6 z-[9999] rounded-full bg-orange-500 px-5 py-3 text-white shadow-xl transition hover:bg-orange-600"
    >
      📲 Install App
    </button>
  );
}