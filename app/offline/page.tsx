"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SlideToRevealQR from ".././components/SlideRevealQR";

export default function OfflinePage() {
  const router = useRouter();

  const [user, setUser] = useState({
    name: "",
    qrCode: "",
    _id: "",
  });

  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    setUser({
      name: localStorage.getItem("customerName") || "Customer",
      qrCode: localStorage.getItem("customerQR") || "",
      _id: localStorage.getItem("customerId") || "",
    });

    setLastSync(localStorage.getItem("lastSync") || "");

    const online = () => router.replace("/");

    window.addEventListener("online", online);

    return () => window.removeEventListener("online", online);
  }, [router]);

  return <SlideToRevealQR user={user} offlineMode lastSync={lastSync} autoOpen />;
}
