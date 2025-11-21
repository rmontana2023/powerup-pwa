"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";
interface User {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
}

export default function TermsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to load user from localStorage:", err);
      }
    }

    loadUser();
  }, []);
  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]  flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>
        <div className="p-6">
          <h1 className="text-2xl text-[var(--accent)] font-bold mb-4">Terms and Conditions</h1>
          <p className="text-white-700">
            These are the terms and conditions for using PowerUp rewards. Please read carefully.
          </p>
        </div>
      </main>
    </LayoutWithNav>
  );
}
