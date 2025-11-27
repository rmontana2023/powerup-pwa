"use client";
import React, { useState } from "react";

interface VoucherTier {
  points: number;
  peso: number;
}

interface VoucherListProps {
  tiers: VoucherTier[];
  onRedeem: (points: number, peso: number) => Promise<void> | void;
  totalPoints: number;
}

export default function VoucherList({ tiers, onRedeem, totalPoints }: VoucherListProps) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleRedeemClick = async (idx: number, points: number, peso: number) => {
    setLoadingIndex(idx);

    try {
      await onRedeem(points, peso); // call parent handler
    } catch (error) {
      console.error("Redeem error:", error);
    } finally {
      setLoadingIndex(null); // reset button loading
    }
  };

  return (
    <div className="w-full max-w-md mt-8">
      <h3 className="text-lg font-semibold mb-4 text-center text-[var(--text-accent)]">
        Redeemable Vouchers
      </h3>

      <div className="space-y-4">
        {tiers.map((tier, idx) => {
          const canRedeem = totalPoints >= tier.points;
          const isLoading = loadingIndex === idx;

          return (
            <div
              key={idx}
              className={`relative flex flex-col sm:flex-row sm:items-center justify-between 
                bg-white/10 backdrop-blur-lg border border-white/10 text-white p-4 rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.3)]
                transition-transform ${
                  canRedeem ? "hover:scale-[1.02]" : "opacity-40 cursor-not-allowed"
                }`}
            >
              {/* Left Section */}
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="bg-[#e66a00] text-white font-bold text-2xl sm:text-3xl px-4 py-2 rounded-tr-lg rounded-bl-lg">
                  {tier.points}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[#e66a00]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7a2 2 0 012-2h3a2 2 0 002 2h2a2 2 0 002-2h3a2 2 0 012 2v3a2 2 0 01-2 2v2a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 00-2-2h-2a2 2 0 00-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2v-2a2 2 0 01-2-2V7z"
                      />
                    </svg>
                    <span className="text-sm font-semibold tracking-wide">REWARDS POINTS</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">₱{tier.peso} Voucher</p>
                </div>
              </div>

              {/* Redeem Button */}
              <button
                disabled={!canRedeem || isLoading}
                onClick={() => canRedeem && handleRedeemClick(idx, tier.points, tier.peso)}
                className={`text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition
                  ${
                    canRedeem && !isLoading
                      ? "bg-[#e66a00] hover:bg-[#c45900]"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
              >
                {isLoading ? "Processing..." : canRedeem ? "REDEEM" : "INSUFFICIENT"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
