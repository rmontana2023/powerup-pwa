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

export default function PolicyPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to load user from localStorage:", err);
    }
  }, []);

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] to-white flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>

        <div className="w-full max-w-md bg-gray-900 text-gray-200 p-6 rounded-xl leading-relaxed space-y-6 border border-gray-700">
          <h1 className="text-2xl text-[var(--accent)] font-bold">Data Privacy Statement</h1>

          <p className="text-sm text-gray-300">
            At <strong>PowerUp Rewards</strong>, your privacy is important to us. This Data Privacy
            Statement explains how we collect, use, store, and protect your personal information
            when you use our mobile application and related services.
          </p>

          <p className="text-sm text-gray-300">
            By using the PowerUp Rewards App, you agree to the practices described in this
            statement.
          </p>

          <section>
            <h2 className="font-semibold text-lg mt-4 mb-2">1. Information We Collect</h2>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              <li>Full Name</li>
              <li>Mobile Number</li>
              <li>Email Address</li>
              <li>Vehicle Information (if provided)</li>
              <li>Transaction History at Power Up Gasoline Station</li>
              <li>Points and Rewards Activity</li>
              <li>Device information and app usage data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mt-4 mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              <li>To register and maintain your PowerUp Rewards account</li>
              <li>To track and manage rewards, points, and redemptions</li>
              <li>To notify you of promotions, offers, and rewards</li>
              <li>To improve app performance and user experience</li>
              <li>To comply with legal and regulatory requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mt-4 mb-2">3. Data Sharing and Disclosure</h2>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              <li>Authorized staff and service providers for app support</li>
              <li>Regulatory authorities when required by law</li>
              <li>Third-party partners only with your explicit consent (e.g. promotions)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mt-4 mb-2">4. Data Storage and Security</h2>
            <p className="text-sm text-gray-300">
              We implement reasonable organizational, technical, and physical measures to protect
              your personal data against unauthorized access, use, or disclosure. Data is stored
              securely and retained only as necessary.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mt-4 mb-2">5. Your Rights as a Data Subject</h2>
            <p className="text-sm text-gray-300 mb-2">
              Under the Data Privacy Act of 2012 (RA 10173), you have the right to:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Withdraw consent to data processing</li>
              <li>Request deletion of your account and data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mt-4 mb-2">6. Contact Information</h2>
            <p className="text-sm text-gray-300">
              <strong>Power Up Gasoline Station – PowerUp Rewards</strong>
              <br />
              Barangay Punta, Ormoc City
              <br />
              Email: powerupgasolinestation@gmail.com
              <br />
              Mobile: 053 561-8197
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mt-4 mb-2">7. Changes to this Statement</h2>
            <p className="text-sm text-gray-300">
              We may update this Data Privacy Statement from time to time. Any changes will be
              posted within the app with the updated effective date.
            </p>
          </section>
        </div>
      </main>
    </LayoutWithNav>
  );
}
