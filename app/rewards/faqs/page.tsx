"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";
import LayoutWithNav from "../../components/LayoutWithNav";
import { ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "About PowerUp Reward Points",
    answer:
      "PowerUp Rewards – Fuel Up, Earn More!  PowerUp Rewards is our exclusive loyalty program designed to give more value every time you gas up at Power Up Gasoline Station",
  },
  {
    question: "How to earn Reward Points?",
    answer:
      "Simply present your registered PowerUp account or QR code at the station before paying. Points are automatically added to your account based on the number of liters purchased or amount spent.",
  },
  {
    question: "How to generate my Reward Points History?",
    answer:
      "Login to your app and go to 'Transactions' page. You can view your past transactions or request a full history to be sent to your email.",
  },
  {
    question: "How to Redeem my Reward Points?",
    answer:
      "Once you have enough points, choose a reward tier under 'Rewards'. You’ll receive a one-time OTP to confirm redemption, and your e-voucher will appear instantly on your screen.",
  },
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const router = useRouter();
  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <LayoutWithNav user={null}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-5 py-6 pb-24 max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-300 hover:text-white transition"
          >
            <ChevronLeft size={22} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <Image src={newlogo} alt="PowerUp Logo" width={120} height={50} />
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-center text-[var(--accent)] mb-6">FAQs</h1>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4"
            >
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-base font-semibold text-white">
                  {faq.question}
                  <span className="text-[var(--accent)] group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">{faq.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </main>
    </LayoutWithNav>
  );
}
