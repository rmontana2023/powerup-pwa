"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // detect route changes
import SplashScreen from "./SplashScreen";
import InstallPWAButton from "./InstallPWAButton";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // current route
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // show splash on every route change
    setShowSplash(true);
    setFadeOut(false);

    const timer = setTimeout(() => {
      setFadeOut(true); // start fade animation
      const removeTimer = setTimeout(() => setShowSplash(false), 700); // match CSS duration
      return () => clearTimeout(removeTimer);
    }, 1000); // show splash at least 1.2s

    return () => clearTimeout(timer);
  }, [pathname]); // run effect whenever route changes

  return (
    <>
      {showSplash && <SplashScreen fadeOut={fadeOut} />}
      {!showSplash && children}
      <InstallPWAButton />
    </>
  );
}
