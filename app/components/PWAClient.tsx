"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function PWAClient() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const goOffline = () => {
      if (pathname !== "/offline") {
        router.replace("/offline");
      }
    };

    const goOnline = () => {
      if (pathname === "/offline") {
        router.replace("/");
      }
    };

    if (!navigator.onLine) {
      goOffline();
    }

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, [pathname, router]);

  //   useEffect(() => {
  //     const checkInternet = async () => {
  //       try {
  //         await fetch("/api/ping", {
  //           cache: "no-store",
  //         });

  //         if (pathname === "/offline") {
  //           router.replace("/");
  //         }
  //       } catch {
  //         if (pathname !== "/offline") {
  //           router.replace("/offline");
  //         }
  //       }
  //     };

  //     checkInternet();

  //     const interval = setInterval(checkInternet, 5000);

  //     return () => clearInterval(interval);
  //   }, [pathname, router]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}
