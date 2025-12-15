"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import newlogo from "../../public/assets/logo/powerup-new-logo.png";
import LayoutWithNav from "../components/LayoutWithNav";
import VoucherList from "../components/VoucherList";
import { QRCodeSVG } from "qrcode.react";
import { Search, History, HelpCircle, Gift } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { X, User } from "lucide-react";
import Swal from "sweetalert2";

interface User {
  _id: string;
  name: string;
  email: string;
  accountType: "ordinary" | "fleet";
}

interface Points {
  totalPoints: number;
  expiresAt: string;
}

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

export default function RewardsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingVoucher, setLoadingVoucher] = useState(false);
  const [voucher, setVoucher] = useState<any>(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [enteredOTP, setEnteredOTP] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  // const [redeemTimer, setRedeemTimer] = useState(30);
  const redeemTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{ points: number; peso: number } | null>(
    null
  );
  const voucherRef = useRef<HTMLDivElement | null>(null);
  const [lockedPoints, setLockedPoints] = useState(0);

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
  // useEffect(() => {
  //   if (qrOpen) {
  //     setRedeemTimer(30);
  //     redeemTimerRef.current = setInterval(() => {
  //       setRedeemTimer((prev) => {
  //         if (prev <= 1) {
  //           clearInterval(redeemTimerRef.current!);
  //           setQrOpen(false);
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);
  //   } else {
  //     if (redeemTimerRef.current) clearInterval(redeemTimerRef.current);
  //     setRedeemTimer(30);
  //   }
  //   return () => {
  //     if (redeemTimerRef.current) clearInterval(redeemTimerRef.current);
  //   };
  // }, [qrOpen]);
  const handleRedeem = async (points: number, peso: number) => {
    if (!user) return alert("Please log in first.");
    if (totalPoints < points) return alert("Insufficient points to redeem this voucher.");
    // ⛔ STOP — ask for confirmation first
    const confirm = await Swal.fire({
      title: "Generate Voucher?",
      html: `
      <div style="font-size:14px">
        You are about to redeem 
        <b>${points} points</b> for 
        <b>₱${peso}</b> voucher.<br/><br/>
        This action cannot be undone.
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, continue",
      cancelButtonText: "Cancel",
      background: "#1c1c1c",
      color: "#fff",
      confirmButtonColor: "#e66a00",
      cancelButtonColor: "#444",
      customClass: { popup: "rounded-2xl" },
    });

    // ❌ If cancelled, stop process
    if (!confirm.isConfirmed) return;

    setSelectedReward({ points, peso });

    try {
      const res = await fetch("/api/otp/send-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      // Backend cooldown
      if (data.cooldown) {
        Swal.fire({
          title: "Slow down ⏳",
          text: `Please wait ${data.cooldown} seconds before requesting a new OTP.`,
          icon: "warning",
          background: "#1c1c1c",
          color: "#fff",
          confirmButtonColor: "#e66a00",
        });
        return;
      }

      if (!data.success) {
        Swal.fire({
          title: "Failed 😢",
          text: data.error || "Unable to send OTP.",
          icon: "error",
          background: "#1c1c1c",
          color: "#fff",
          confirmButtonColor: "#e66a00",
        });
        return;
      }

      Swal.fire({
        title: "OTP Sent! 📩",
        text: "Check your email for the 6-digit code.",
        icon: "success",
        background: "#1c1c1c",
        color: "#fff",
        confirmButtonColor: "#e66a00",
      });
      setEnteredOTP(""); // reset input field
      setOtpModalOpen(true);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error 😢",
        text: "Error sending OTP",
        icon: "error",
        background: "#1c1c1c",
        color: "#fff",
        confirmButtonColor: "#e66a00",
      });
    }
  };

  const handleValidateOTP = async () => {
    if (!user || !selectedReward) return;

    try {
      const verify = await fetch("/api/otp/verify-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, otp: enteredOTP }),
      });

      const res = await verify.json();
      if (!res.success) {
        Swal.fire({
          title: "Invalid OTP 😕",
          text: "Please double-check your 6-digit code and try again.",
          icon: "error",
          background: "#1c1c1c",
          color: "#fff",
          confirmButtonColor: "#e66a00",
          confirmButtonText: "Retry",
          customClass: { popup: "rounded-2xl" },
        });

        return;
      }

      // OTP is valid → Create voucher
      setLoadingVoucher(true);
      const createRes = await fetch("/api/vouchers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user._id,
          amount: selectedReward.peso,
          points: selectedReward.points,
        }),
      });

      const data = await createRes.json();
      console.log("🚀 ~ handleValidateOTP ~ data:", data);
      if (data.success) {
        // Update locked points
        setLockedPoints((prev) => prev + selectedReward.points);
        setTotalPoints(data.totalPoints);
        setVoucher(data.voucher);
        setOtpModalOpen(false);
        setQrOpen(true);
        Swal.fire({
          title: "Voucher Redeemed! 🎉",
          text: "Your e-voucher is now ready. Scan or download it below.",
          icon: "success",
          background: "#1c1c1c",
          color: "#fff",
          confirmButtonColor: "#e66a00",
          confirmButtonText: "Show My Voucher",
          customClass: { popup: "rounded-2xl" },
        }).then(() => {
          setVoucher(data.voucher);
          setOtpModalOpen(false);
          setQrOpen(true);
        });
      } else {
        alert(data.error || "Failed to redeem voucher");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoadingVoucher(false);
    }
  };

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={160} height={50} priority />
        </div>

        {/* Search bar */}
        <div className="w-full max-w-md flex items-center bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 mb-4">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="What are you looking for?"
            className="bg-transparent w-full outline-none text-sm text-gray-200 placeholder-gray-400"
          />
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-md flex justify-between mb-5">
          <button
            onClick={() => router.push("/transactions")}
            className="w-[48%] flex items-center justify-center gap-2 border border-white/10 bg-white/5 rounded-xl py-2 text-sm hover:bg-white/10 transition"
          >
            <History size={16} /> My Rewards History
          </button>
          <button
            onClick={() => router.push("/rewards/faqs")}
            className="w-[48%] flex items-center justify-center gap-2 border border-white/10 bg-white/5 rounded-xl py-2 text-sm hover:bg-white/10 transition"
          >
            <HelpCircle size={16} /> FAQs
          </button>
        </div>

        {/* Points summary */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg p-6 text-center mb-6">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading points...</p>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-[var(--accent)]">
                {(totalPoints - lockedPoints).toFixed(2)}
              </h2>
            </>
          )}
        </div>

        {/* Redeem / Voucher buttons */}
        <div className="w-full max-w-md flex justify-between mb-6">
          {/* <button
            onClick={() => router.push("/rewards/pay")}
            className="w-[48%] flex items-center justify-center gap-2 bg-[var(--accent)] text-white rounded-xl py-2 text-sm font-semibold hover:opacity-90 transition"
          >
            <Gift size={16} /> Pay with Points
          </button> */}
          <button
            onClick={() => router.push("/rewards/vouchers")}
            className="w-[100%] flex items-center justify-center gap-2 bg-[#e66a00] text-white rounded-xl py-2 text-sm font-semibold hover:opacity-90 transition"
          >
            <Gift size={16} /> My Vouchers
          </button>
        </div>

        {/* Voucher list based on account type */}
        {user?.accountType && (
          <VoucherList
            tiers={REWARD_TIERS[user.accountType]}
            onRedeem={handleRedeem}
            totalPoints={totalPoints - lockedPoints} // ✅ pass here
          />
        )}
        {otpModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-xl">
              <h3 className="text-lg font-bold text-[#e66a00] mb-2">OTP Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit OTP sent to your registered contact.
              </p>

              <input
                type="text"
                value={enteredOTP}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => setEnteredOTP(e.target.value)}
                maxLength={6}
                placeholder="Enter OTP"
                className="text-center text-black bg-white border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e66a00]"
              />

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidateOTP}
                  className="px-4 py-2 rounded-lg bg-[#e66a00] text-white font-semibold"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        {voucher && (
          <div
            ref={voucherRef}
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-[60]"
          >
            {/* Blurred QR background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-lg">
              <QRCodeSVG value={voucher.code} size={300} fgColor="#ffffff" bgColor="#000000" />
            </div>

            {/* Foreground Card */}
            <div className="relative bg-neutral-900 text-white rounded-2xl p-6 shadow-2xl w-80 text-center border border-orange-500/30">
              {/* Close */}
              <button
                onClick={() => setVoucher(null)}
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
              <p className="text-sm font-medium text-white">{user?.name}</p>

              {/* Timer */}
              {/* <p className="text-sm font-semibold text-orange-400">Expires in: {redeemTimer}s</p> */}

              {/* Divider */}
              <div className="border-t border-white/20 my-4" />

              {/* Warning */}
              <p className="text-xs text-red-400 font-semibold px-2">
                ⚠️ Screenshots will not be entertained by the cashier.
              </p>

              {/* Buttons */}
              <div className="flex justify-center mt-6 z-10">
                <button
                  onClick={async () => {
                    if (!voucherRef.current) return;

                    try {
                      // Generate PNG from voucherRef
                      const dataUrl = await htmlToImage.toPng(voucherRef.current, {
                        cacheBust: true,
                      });

                      // Convert DataURL to Blob
                      const response = await fetch(dataUrl);
                      const blob = await response.blob();
                      const file = new File([blob], `${voucher.code}.png`, { type: blob.type });

                      // Mobile-friendly save
                      if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          files: [file],
                          title: "PowerUp E-Voucher",
                          text: `Here’s my PowerUp voucher worth ₱${voucher.amount}. Code: ${voucher.code}`,
                        });
                      } else {
                        // fallback download
                        const link = document.createElement("a");
                        link.download = `${voucher.code}.png`;
                        link.href = dataUrl;
                        link.click();
                      }
                    } catch (error) {
                      console.error("Error downloading voucher:", error);
                      alert("Failed to download voucher. Please try again.");
                    }
                  }}
                  className="w-full max-w-[200px] bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.97]"
                >
                  Download Voucher
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </LayoutWithNav>
  );
}
