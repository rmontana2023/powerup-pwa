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

       <div className="w-full max-w-4xl bg-gray-900 text-gray-200 p-6 rounded-xl leading-relaxed space-y-8 border border-gray-700">

        <h1 className="text-3xl font-bold text-[var(--accent)]">
          PowerUp Rewards – Terms & Conditions
        </h1>

        <p>
         Welcome to <strong>PowerUp Rewards</strong>! By downloading, registering, and using this app, you agree to the following Terms & Conditions. Please read them carefully.
        </p>

        {/* 1 */}
        <section>
          <h2 className="text-xl font-bold mb-3">1. Membership Eligibility</h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>PowerUp Rewards is open to all customers of Power Up Gasoline Station.</li>
            <li>Registration requires a valid mobile number and other basic information.</li>
            <li>Each customer is allowed to maintain only one (1) PowerUp Rewards account.</li>
          </ul>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-bold mb-3">2. Earning Points</h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>Points are earned for eligible fuel purchases made at participating Power Up Gasoline Station branches.</li>
            <li>The number of points earned depends on the current promotional mechanics established by the station.</li>
            <li>Your PowerUp Rewards QR Code must be presented before payment to earn points.</li>
            <li>Points are account-bound, non-transferable, and have no cash value.</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-bold mb-3">3. E-Vouchers</h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>E-Vouchers generated through the PowerUp Rewards App are exclusively for the registered account holder.</li>
            <li>E-Vouchers are strictly non-transferable and may not be shared, sold, gifted, assigned, or transferred.</li>
            <li>Only the registered account holder may redeem an E-Voucher.</li>
            <li>Power Up Gasoline Station may require a valid government-issued ID or other proof of identity before redemption.</li>
            <li>Any attempt to duplicate, alter, reproduce, sell, misuse, or fraudulently redeem an E-Voucher—including screenshots, copied QR Codes, or unauthorized access—may result in immediate invalidation and disciplinary action.</li>
            <li>Once generated, an E-Voucher cannot be cancelled, replaced, reissued, or converted back into reward points.</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-bold mb-3">4. Redeeming Rewards</h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>Accumulated points may be redeemed for rewards, discounts, or available E-Vouchers within the PowerUp Rewards App.</li>
            <li>Generated E-Vouchers may only be redeemed at participating Power Up Gasoline Station branches.</li>
            <li>Customers must present:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The PowerUp Rewards E-Voucher QR Code.</li>
                <li>A valid government-issued ID for identity verification when requested.</li>
              </ul>
            </li>
            <li>The name on the ID must match the registered account information. Redemption may be refused if verification cannot be completed.</li>
            <li>Multiple E-Vouchers may be redeemed in a single transaction.</li>
            <li>If the total value of redeemed E-Vouchers exceeds the total purchase amount, the remaining balance shall be forfeited. No cash change, refund, store credit, or carry-over balance will be provided.</li>
            <li>Only valid, unused, and authentic E-Vouchers will be accepted.</li>
            <li>Once redeemed, an E-Voucher becomes permanently invalid.</li>
            <li>Redeemed rewards and E-Vouchers are non-refundable, non-replaceable, non-reissuable, and cannot be exchanged for cash.</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-bold mb-3">5. Validity of Points and E-Vouchers</h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>PowerUp Rewards points do not expire while the program remains active.</li>
            <li>E-Vouchers are valid only within the validity period indicated in the app.</li>
            <li>Expired points or E-Vouchers cannot be reinstated or reissued.</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-bold mb-3">6. Misuse and Fraud</h2>

          <p className="mb-3">
            Any misuse, manipulation, or fraudulent activity—including but not limited to unauthorized transactions, duplicate accounts, falsified purchases, or E-Voucher abuse—may result in:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Cancellation of accumulated points.</li>
            <li>Invalidation of generated E-Vouchers.</li>
            <li>Suspension or permanent termination of the PowerUp Rewards account.</li>
          </ul>

          <p className="mt-3">
            Power Up Gasoline Station reserves the right to investigate and take appropriate action against any fraudulent or abusive activity.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-bold mb-3">7. Changes to the Program</h2>

          <p className="mb-3">
            Power Up Gasoline Station reserves the right, at its sole discretion, to:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Modify the points or rewards system.</li>
            <li>Change, suspend, or discontinue E-Vouchers or rewards.</li>
            <li>Terminate the PowerUp Rewards Program.</li>
          </ul>

          <p className="mt-3">
            Any updates will be announced through the PowerUp Rewards App or the official Power Up Gasoline Station Facebook Page.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-bold mb-3">8. Liability</h2>

          <p className="mb-3">
            Power Up Gasoline Station shall not be liable for:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Lost or stolen accounts, QR Codes, or mobile devices.</li>
            <li>Unauthorized account use resulting from user negligence.</li>
            <li>Technical issues beyond its control, including internet connectivity and third-party service interruptions.</li>
            <li>Rewards and E-Vouchers are provided "as is" and remain subject to availability.</li>
          </ul>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-xl font-bold mb-3">9. Data Privacy</h2>

          <p>
            By registering for and using the PowerUp Rewards App, you consent to the
            collection, use, storage, and processing of your personal information in
            accordance with the PowerUp Rewards Data Privacy Statement and applicable
            Philippine data privacy laws.
          </p>
        </section>

      </div>
      </main>
    </LayoutWithNav>
  );
}
