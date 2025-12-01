"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";
import { X, User } from "lucide-react";
import { FaMotorcycle, FaCar } from "react-icons/fa";
import Image from "next/image";
import newlogo from "../../public/assets/logo/powerup-new-logo.png";
import LayoutWithNav from "../components/LayoutWithNav";
import { Copy } from "lucide-react";

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
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  qrCode: string;
  accountType: string;
  totalPoints: number;
}

interface Voucher {
  code: string;
  amount: number;
  expiresAt: Date;
  createdAt: Date;
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
  const [copied, setCopied] = useState(false);
  const [lockedPoints, setLockedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      const totalPoints = data.user?.totalPoints ?? 0;
      // fetch unredeemed vouchers
      const resVouchers = await fetch("/api/vouchers?customerId=" + data.user._id);
      const dataVouchers = await resVouchers.json();
      const unredeemed = dataVouchers.vouchers.filter((v: any) => !v.redeemed);
      console.log("🚀 ~ fetchUser ~ unredeemed:", unredeemed);
      const sumLocked = unredeemed.reduce((sum: number, v: any) => sum + (v.pointsLocked || 0), 0);
      console.log("🚀 ~ fetchUser ~ sumLocked:", sumLocked);

      setUser(data.user);
      setLockedPoints(sumLocked);
      setTotalPoints(totalPoints);
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

  // const openNavQR = () => {
  //   console.log("🚀 ~ openNavQR ~ user:", user);
  //   setVoucher({
  //     code: user.qrCode, // or `${user._id}:${user.name}` for example
  //     amount: 0,
  //     expiresAt: new Date(Date.now() + 30 * 1000),
  //   });
  //   // setQrOpen(true);
  //   setRedeemTimer(30);
  // };
  const handleCopy = () => {
    navigator.clipboard.writeText(user?.qrCode || "");
    setCopied(true);

    // fade out after 1.2 sec
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 relative">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>

        {/* Greeting & Points */}
        {/* ---------- USER INFO CARD ---------- */}
        <div className="w-full max-w-md relative bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl shadow-lg p-6 mb-6">
          <p className="text-2xl font-semibold tracking-tight">
            Good day,{" "}
            <span className="text-[var(--accent)]">
              {user.name || `${user.firstName} ${user.lastName}`}
            </span>
          </p>

          {/* QR Code + Copy Button */}
          <div className="mt-4 flex items-center gap-2">
            <p className="text-sm text-[var(--text-muted)] break-all">
              <span className="font-semibold text-[var(--accent)]">{user?.qrCode}</span>
            </p>

            {/* Copy Icon Button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-full hover:bg-[var(--accent)]/10 transition flex items-center justify-center"
            >
              <Copy className="w-4 h-4 text-[var(--accent)]" />
            </button>
          </div>

          {/* Copied Animation */}
          <div
            className={`absolute right-5 top-5 text-xs px-3 py-1 rounded-xl bg-[var(--accent)] text-white shadow-md transition-all duration-300 ${
              copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            QR Copied!
          </div>

          {/* Account Type */}
          {/* Account Type */}
          <div className="mt-4">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold 
    bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
            >
              {user?.accountType
                ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)
                : "Customer"}
            </span>
          </div>
        </div>

        {/* ---------- TOTAL POINTS CARD ---------- */}
        <div className="w-full max-w-md bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl shadow-md p-6 mb-6 flex flex-col items-center text-center">
          <p className="text-6xl font-extrabold text-[var(--accent)] tracking-tight drop-shadow-sm">
            {(totalPoints - lockedPoints).toFixed(2)}
          </p>
          <p className="text-lg font-medium text-[var(--text-muted)] mt-2">Available Points</p>
        </div>

        {/* Earn Points */}
        <div className="w-full max-w-md mt-6 mb-5">
          <h2 className="text-lg font-bold mb-4">Earn Points</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Motorcycle */}
            <div className="flex flex-col items-center bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl shadow-md">
              <FaMotorcycle className="w-10 h-10 text-[var(--accent)] mb-2" />
              <p className="text-sm font-semibold">Motorcycles</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">1 liter = 1 point</p>
            </div>
            {/* Cars */}
            <div className="flex flex-col items-center bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl shadow-md">
              <FaCar className="w-10 h-10 text-[var(--accent)] mb-2" />
              <p className="text-sm font-semibold">Cars</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">1 liter = 1 point</p>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="w-full max-w-md mb-8">
          <h2 className="text-lg font-bold mb-4">Rewards</h2>
          <div className="bg-[var(--card-bg)] rounded-3xl shadow-md border border-[var(--border-color)] p-5 flex flex-col">
            {userTiers.map((tier, idx) => (
              <p
                key={idx}
                className={`text-base font-semibold ${
                  user.totalPoints >= tier.points ? "" : "opacity-50"
                }`}
              >
                {tier.points} Points = ₱{tier.peso.toFixed(2)}
              </p>
            ))}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => router.push("/rewards")}
                className={`bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white px-6 py-2 rounded-lg transition-all ${
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
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-[60]">
            {/* Blurred QR background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-lg">
              <QRCodeSVG value={voucher.code} size={300} fgColor="#ffffff" bgColor="#000000" />
            </div>

            {/* Foreground Card */}
            <div className="relative bg-neutral-900 text-white rounded-2xl p-6 shadow-2xl w-80 text-center border border-orange-500/30">
              {/* Close */}
              <button
                onClick={() => setQrOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Logo */}
              <div className="flex justify-center mb-4">
                <Image
                  src={newlogo}
                  alt="PowerUp Logo"
                  width={90}
                  height={90}
                  className="drop-shadow-lg"
                />
              </div>

              {/* QR */}
              <div
                id="voucherQRContainer"
                className="relative z-10 flex flex-col items-center justify-center mb-4 bg-white p-4 rounded-xl shadow-md"
              >
                <QRCodeSVG value={voucher.code} size={180} bgColor="#ffffff" fgColor="#000000" />
              </div>

              {/* Voucher Amount */}
              <p className="text-3xl font-bold text-orange-500 mb-1">
                ₱{voucher.amount ? voucher.amount : "N/A"} OFF
              </p>

              {/* “E-Voucher” Label */}
              <p className="text-lg font-semibold text-white tracking-widest mb-2">E-Voucher</p>

              {/* Voucher Code */}
              <p className="text-base font-semibold text-orange-500 mb-3">Code: {voucher.code}</p>

              {/* Created On */}
              <p className="text-xs text-gray-400 mb-1">
                Created on:{" "}
                {new Date(voucher.createdAt)
                  .toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })
                  .toUpperCase()}
              </p>
              <p className="text-xs text-gray-400 mb-1">
                Valid until{" "}
                {new Date(voucher.expiresAt)
                  .toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })
                  .toUpperCase()}
              </p>

              {/* Customer Name */}
              <p className="text-sm font-medium text-white">{user.name}</p>

              {/* Timer */}
              <p className="text-sm font-semibold text-orange-400">Expires in: {redeemTimer}s</p>

              {/* Divider */}
              <div className="border-t border-white/20 my-4" />

              {/* Warning */}
              <p className="text-xs text-red-400 font-semibold px-2">
                ⚠️ Screenshots will not be entertained by the cashier.
              </p>

              {/* Buttons */}
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
                        title: "PowerUp E-Voucher",
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
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg shadow transition"
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
