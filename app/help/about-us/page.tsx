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

export default function AboutUsPage() {
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
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] to-white flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>
        <div className="w-full max-w-md bg-gray-900 text-gray-200 p-6 rounded-xl leading-relaxed space-y-6 border border-gray-700">
          <h1 className="text-2xl font-bold text-[var(--accent)]">About PowerUp Rewards</h1>

          <p>
            PowerUp Rewards is our exclusive loyalty program designed to give you more value every
            time you gas up at Power Up Gasoline Station.
          </p>

          <p>
            With PowerUp Rewards, you don’t just fuel your ride –{" "}
            <span className="font-semibold">you fuel your rewards!</span>
          </p>

          <ul className="list-disc pl-5 space-y-1">
            <li>Earn points every time you load fuel</li>
            <li>Points never expire</li>
            <li>Redeem perks, promos, and surprises made just for you 🎉</li>
          </ul>

          <p className="font-semibold">It’s simple: Gas up. Scan. Earn. Repeat.</p>

          <p>
            Whether you drive a multicab, private car, motorcycle, or any vehicle, you can enjoy
            perks, discounts, and exciting promos simply by fueling with us. Just gas up, scan, and
            watch your points grow.
          </p>

          <p>Because at Power Up, we believe your loyalty deserves more power. 🚗⛽✨</p>
        </div>
      </main>
    </LayoutWithNav>
  );
}
