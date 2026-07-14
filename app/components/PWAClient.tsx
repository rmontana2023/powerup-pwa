"use client";

import { useEffect } from "react";

export default function PWAClient() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered", registration);

        registration.update();
      })
      .catch(console.error);
  }, []);

  return null;
}