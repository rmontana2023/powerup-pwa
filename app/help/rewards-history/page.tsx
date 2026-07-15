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

export default function RewardsHistoryPage() {
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
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>
        <div className="max-w-2xl w-full space-y-8">
          <h1 className="text-2xl font-bold text-[var(--accent)]">
            How to Generate, Redeem E-Vouchers & Earn Points
          </h1>

          {/* Earn Points */}
          <section className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-4">
              🔹 How to Earn Points (Use Your QR Code)
            </h2>

            <ol className="list-decimal list-inside space-y-2 text-sm leading-7 text-gray-300">
              <li>Open the <strong>PowerUp Rewards</strong> app.</li>
              <li>Log in to your account.</li>
              <li>Tap the <strong>QR Code</strong> button to display your QR Code.</li>
              <li>Present your QR Code to the cashier <strong>before payment</strong>.</li>
              <li>Complete your fuel purchase.</li>
              <li>Your reward points will automatically be credited to your account.</li>
            </ol>
          </section>

          {/* Generate Voucher */}
          <section className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-4">
              🔹 How to Generate an E-Voucher
            </h2>

            <ol className="list-decimal list-inside space-y-2 text-sm leading-7 text-gray-300">
              <li>Open the <strong>PowerUp Rewards</strong> app.</li>
              <li>Go to <strong>Rewards / Points</strong>.</li>
              <li>Select an available E-Voucher.</li>
              <li>Tap <strong>Redeem / Generate</strong>.</li>
              <li>Your E-Voucher QR Code will appear in the app.</li>
            </ol>
          </section>

          {/* Redeem Voucher */}
          <section className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-4">
              🔹 How to Redeem Your E-Voucher
            </h2>

            <ol className="list-decimal list-inside space-y-2 text-sm leading-7 text-gray-300">
              <li>Visit any participating <strong>Power Up Gasoline Station</strong>.</li>
              <li>Present your E-Voucher QR Code(s) to the cashier.</li>
              <li>Present a valid government-issued ID if requested for verification.</li>
              <li>The cashier will scan and validate your voucher(s).</li>
              <li>Enjoy your fuel credit or reward 🎉</li>
            </ol>
          </section>

          {/* Important Reminders */}
          <section className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-5">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">
              ℹ️ Important Reminders
            </h2>

            <ul className="list-disc list-inside space-y-2 text-sm leading-7 text-gray-300">
              <li>Present your QR Code <strong>before payment</strong> to earn points.</li>
              <li>Multiple E-Vouchers may be used in a single transaction.</li>
              <li>E-Vouchers are valid for <strong>one-time use only</strong>.</li>
              <li>
                No cash change or refund will be given if the voucher value exceeds the
                total amount payable.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </LayoutWithNav>
  );
}
