"use client";
import React, { useEffect, useState } from "react";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import Image from "next/image";
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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user:", err);
      }
    }
  }, []);

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>

        <div className="w-full max-w-md bg-gray-900 text-gray-200 p-6 rounded-xl leading-relaxed space-y-6 border border-gray-700">
          <h1 className="text-2xl font-bold text-[var(--accent)]">
            PowerUp Rewards – Terms & Conditions
          </h1>
          <p>
            Welcome to PowerUp Rewards! By downloading, registering, and using this app, you agree
            to the following terms and conditions. Please read them carefully.
          </p>

          <section>
            <h2 className="text-xl font-bold mb-2">1. Membership Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>PowerUp Rewards is open to all customers of Power Up Gasoline Station.</li>
              <li>Registration requires a valid mobile number and other basic information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">2. Earning Points</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Points are earned every time you purchase fuel at Power Up Gasoline Station.</li>
              <li>
                The number of points earned depends on the promo or mechanics set by the station.
              </li>
              <li>
                Points will only be credited if you present your PowerUp Rewards QR code before
                payment.
              </li>
              <li>Points are non-transferable and have no cash value.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">3. Redeeming Rewards</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Accumulated points can be redeemed for rewards, discounts, or items as specified in
                the app or at the station.
              </li>
              <li>Rewards are subject to availability and may change without prior notice.</li>
              <li>Once redeemed, rewards are non-refundable and cannot be exchanged for cash.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">4. Validity of Points</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>PowerUp Rewards points do not expire.</li>
              <li>Your points will remain in your account as long as the program is active.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">5. Misuse and Fraud</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Any misuse, manipulation, or fraudulent activity (e.g., multiple accounts, fake
                transactions) may result in:
              </li>
              <ul className="list-disc pl-10 space-y-1">
                <li>Cancellation of points</li>
                <li>Suspension or termination of your account</li>
              </ul>
              <li>
                Power Up Gasoline Station reserves the right to take appropriate action if fraud is
                detected.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">6. Changes to the Program</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Power Up Gasoline Station may, at its sole discretion:</li>
              <ul className="list-disc pl-10 space-y-1">
                <li>Change the points system</li>
                <li>Modify or discontinue rewards</li>
                <li>End the program entirely</li>
              </ul>
              <li>Any changes will be announced via the app or our official Facebook page.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">7. Liability</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Power Up Gasoline Station is not responsible for:</li>
              <ul className="list-disc pl-10 space-y-1">
                <li>Lost or stolen accounts, QR codes, or mobile devices</li>
                <li>
                  Technical issues beyond our control (e.g., internet connectivity, third-party
                  services)
                </li>
              </ul>
              <li>Rewards are offered “as is” and subject to availability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">8. Data Privacy</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                By using the app, you agree to the collection and processing of your personal data
                in accordance with our Data Privacy Statement.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </LayoutWithNav>
  );
}
