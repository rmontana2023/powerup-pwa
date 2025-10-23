"use client";
import React, { useEffect, useState } from "react";

const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandalone, setIsInStandalone] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
    setIsInStandalone("standalone" in window.navigator && (window.navigator as any).standalone);

    // ✅ Works only on Android/Chrome
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert(
        "To install this app:\n\n1. Tap the Share icon (the square with the arrow ↑)\n2. Choose 'Add to Home Screen'"
      );
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("App installed");
      }
      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  if (isInStandalone) return null; // Already installed
  if (!showButton && !isIOS) return null; // Only show on eligible browsers

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-[var(--accent)]  text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-600"
    >
      Install App
    </button>
  );
};

export default InstallPWAButton;
