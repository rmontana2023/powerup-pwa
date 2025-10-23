"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
import { X, Bike, Truck, User } from "lucide-react";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";
import LayoutWithNav from "../components/LayoutWithNav";

const REWARD_TIERS: Record<string, { points: number; peso: number }[]> = {
  ordinary: [
    { points: 50, peso: 20 },
    { points: 100, peso: 40 },
    { points: 250, peso: 100 },
    { points: 500, peso: 250 },
  ],
  fleet: [
    { points: 1000, peso: 500 },
    { points: 2000, peso: 1200 },
    { points: 5000, peso: 3500 },
  ],
};
interface User {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
  accountType: string;
  totalPoints: number;
}

interface Voucher {
  code: string;
  amount: number;
  expiresAt: Date;
}
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  // QR / Redeem state
  const [qrOpen, setQrOpen] = useState(false);
  const [showSlideDialog, setShowSlideDialog] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [redeemTimer, setRedeemTimer] = useState(30);
  const redeemTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStart = useRef(0);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    }
    fetchUser();
  }, [router]);

  // QR Countdown
  useEffect(() => {
    if (qrOpen) {
      setRedeemTimer(30);
      redeemTimerRef.current = setInterval(() => {
        setRedeemTimer((prev) => {
          if (prev <= 1) {
            clearInterval(redeemTimerRef.current!);
            setQrOpen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (redeemTimerRef.current) clearInterval(redeemTimerRef.current);
      setRedeemTimer(30);
    }
    return () => {
      if (redeemTimerRef.current) clearInterval(redeemTimerRef.current);
    };
  }, [qrOpen]);

  if (!user) return null;

  const userTiers = REWARD_TIERS[user.accountType || "ordinary"];
  const canRedeem = userTiers.some((tier) => user.totalPoints >= tier.points);

  const startDrag = (e: React.PointerEvent) => {
    setDragging(true);
    pointerStart.current = e.clientX;
  };

  const onDrag = (e: React.PointerEvent) => {
    if (!dragging || !sliderRef.current) return;
    const delta = e.clientX - pointerStart.current;
    const sliderWidthPx = sliderRef.current.offsetWidth;
    setSliderWidth(Math.min(100, Math.max(0, (delta / sliderWidthPx) * 100)));
  };
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);

    if (sliderWidth >= 80) {
      revealVoucher(); // <-- generate voucher when user slides
    }

    setSliderWidth(0);
  };

  const handleRedeemClick = () => {
    if (!canRedeem) return;
    setShowSlideDialog(true);
  };
  const revealVoucher = async (selectedTier?: { points: number; peso: number }) => {
    if (!selectedTier || loadingVoucher) return;

    setLoadingVoucher(true);
    try {
      const res = await fetch("/api/vouchers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user._id,
          amount: selectedTier.peso,
          points: selectedTier.points,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVoucher(data.voucher);
        setQrOpen(true);
        setRedeemTimer(30);
      } else {
        alert(data.error || "Failed to generate voucher");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate voucher");
    } finally {
      setLoadingVoucher(false);
      setShowSlideDialog(false);
    }
  };

  const handleRedeemSelect = (tier: { points: number; peso: number }) => {
    if (user.totalPoints < tier.points) {
      alert("Insufficient points");
      return;
    }
    revealVoucher(tier);
  };

  const openNavQR = () => {
    console.log("🚀 ~ openNavQR ~ user:", user);
    setVoucher({
      code: user.qrCode, // or `${user._id}:${user.name}` for example
      amount: 0,
      expiresAt: new Date(Date.now() + 30 * 1000),
    });
    // setQrOpen(true);
    setRedeemTimer(30);
  };

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center px-4 py-6 relative">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={logo2} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>

        {/* Greeting & Points */}
        <div className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-orange-100 rounded-3xl shadow-lg p-5 mb-5">
          <p className="text-xl font-semibold text-gray-800 text-left">
            Good day, <span className="text-orange-500">{user.name}</span>
          </p>
          <div className="flex flex-col items-center mt-2 mb-5">
            <p className="text-5xl font-extrabold text-orange-500 mt-1 mb-2 tracking-wide">
              {user.totalPoints}
            </p>
            <p className="text-md font-medium text-gray-700">Total Points</p>
          </div>
        </div>

        {/* Earn Points */}
        <div className="w-full max-w-md mt-6 mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Earn Points</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg border border-orange-100 p-4 rounded-2xl shadow-md">
              <Bike className="w-10 h-10 text-orange-500 mb-2" />
              <p className="text-sm font-semibold text-gray-800">Tricycle</p>
              <p className="text-xs text-gray-500 mt-1">1 liter = 1 point</p>
            </div>
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg border border-orange-100 p-4 rounded-2xl shadow-md">
              <Truck className="w-10 h-10 text-orange-500 mb-2" />
              <p className="text-sm font-semibold text-gray-800">Multicab</p>
              <p className="text-xs text-gray-500 mt-1">1 liter = 1 point</p>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="w-full max-w-md mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Rewards</h2>
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-md border border-orange-100 p-5 flex flex-col">
            {userTiers.map((tier, idx) => (
              <p
                key={idx}
                className={`text-base font-semibold text-gray-800 ${
                  user.totalPoints >= tier.points ? "" : "opacity-50"
                }`}
              >
                {tier.points} Points = ₱{tier.peso.toFixed(2)}
              </p>
            ))}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleRedeemClick}
                className={`bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all ${
                  !canRedeem ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!canRedeem}
              >
                Redeem
              </button>
            </div>
          </div>
        </div>

        {/* Redeem Selection Modal */}
        {showSlideDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-80 text-center relative">
              <X
                className="absolute top-3 right-3 w-5 h-5 text-gray-500 cursor-pointer"
                onClick={() => setShowSlideDialog(false)}
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Redeem Amount</h3>

              <div className="space-y-3">
                {userTiers.map((tier, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRedeemSelect(tier)}
                    className={`w-full py-2 rounded-lg font-semibold transition-all ${
                      user.totalPoints >= tier.points
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    ₱{tier.peso} — {tier.points} Points
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard QR / Voucher QR */}
        {qrOpen && voucher && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-lg z-[60]">
            {/* Blurred QR background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-lg">
              <QRCodeSVG value={voucher.code} size={300} />
            </div>

            {/* Foreground Card */}
            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl w-80 text-center border border-orange-100">
              {/* Close */}
              <button
                onClick={() => setQrOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* User name */}
              <p className="text-lg font-semibold text-orange-600 mb-2">{user.name}</p>

              {/* Watermark */}
              <p className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-orange-300/20 rotate-[-30deg] select-none pointer-events-none">
                {user.name}
              </p>

              {/* QR */}
              <div
                id="voucherQRContainer"
                className="relative z-10 flex flex-col items-center justify-center mb-3 bg-white p-3 rounded-lg shadow"
              >
                <QRCodeSVG value={voucher.code} size={180} bgColor="#fff" fgColor="#000" />
                <p className="text-xs mt-2 font-medium text-gray-600">{voucher.code}</p>
              </div>

              {/* Voucher details */}
              <p className="text-xs text-gray-600 mb-1">Voucher Code: {voucher.code}</p>
              <p className="text-sm font-medium text-gray-700">
                Amount: ₱ {voucher.amount ? voucher.amount : "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                Expires: {new Date(voucher.expiresAt).toLocaleDateString()}
              </p>
              <p className="text-sm font-semibold text-orange-600 mt-2">
                Expires in: {redeemTimer}s
              </p>

              {/* Warning */}
              <p className="text-xs text-red-600 font-semibold mt-4 px-2">
                ⚠️ Screenshots will not be entertained by the cashier.
              </p>

              {/* Share & Download buttons */}
              <div className="flex justify-center gap-3 mt-5 z-10">
                <button
                  onClick={async () => {
                    const qrElement = document.getElementById("voucherQRContainer");
                    if (!qrElement) return;

                    try {
                      const dataUrl = await htmlToImage.toPng(qrElement);
                      const link = document.createElement("a");
                      link.download = `${voucher.code}.png`;
                      link.href = dataUrl;
                      link.click();
                    } catch (error) {
                      console.error("Error downloading QR:", error);
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg shadow transition"
                >
                  Download
                </button>

                <button
                  onClick={async () => {
                    try {
                      const shareData = {
                        title: "PowerUp Voucher",
                        text: `Here’s my PowerUp voucher worth ₱${voucher.amount}. Code: ${voucher.code}`,
                        url: window.location.origin,
                      };
                      if (navigator.share) {
                        await navigator.share(shareData);
                      } else {
                        alert("Sharing not supported on this device.");
                      }
                    } catch (err) {
                      console.error("Share failed:", err);
                    }
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg shadow transition"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </LayoutWithNav>
  );
}

// function MenuItem({ label, icon }: { label: string; icon: React.ReactNode }) {
//   return (
//     <div className="flex flex-col items-center justify-center bg-white/70 backdrop-blur-lg p-4 rounded-2xl shadow hover:scale-105 hover:bg-orange-50 transition cursor-pointer">
//       <div className="mb-2 text-orange-500">{icon}</div>
//       <span className="text-xs font-medium text-gray-800">{label}</span>
//     </div>
//   );
// }

// function NavItem({
//   label,
//   icon,
//   onClick,
// }: {
//   label: string;
//   icon: React.ReactNode;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-500 transition"
//     >
//       {icon}
//       <span className="text-xs mt-1">{label}</span>
//     </button>
//   );
// }
