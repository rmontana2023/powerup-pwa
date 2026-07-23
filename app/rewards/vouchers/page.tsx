"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import newlogo from "@/public/assets/logo/powerup-new-logo.png";
import { POWERUP_LOGO } from "@/lib/logoBase64";
import { Gift, ArrowLeft, Loader2, CheckCircle, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode"
import Swal from "sweetalert2";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Voucher {
  _id: string;
  code: string;
  amount: number;
  points: number;
  redeemed: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function MyVouchersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    async function fetchUserAndVouchers() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        const res = await fetch(`/api/vouchers/user/${userData.user._id}`);
        const data = await res.json();

        if (data.success) {
          setVouchers(data.vouchers);
        }
      } catch (err) {
        console.error("Error fetching vouchers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndVouchers();
  }, [router]);

  const handleDownloadVoucher = async () => {
  if (!selectedVoucher || !user) return;

  try {
    const canvas = document.createElement("canvas");

    canvas.width = 1200;
    canvas.height = 1800;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Background
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Orange border
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // ---------- Logo ----------
    const logo = new window.Image();

    logo.src = POWERUP_LOGO;

    await new Promise<void>((resolve, reject) => {
      logo.onload = () => resolve();
      logo.onerror = reject;
    });

    ctx.drawImage(
      logo,
      canvas.width / 2 - 120,
      70,
      240,
      240
    );

    // ---------- QR ----------
    const qrData = await QRCode.toDataURL(selectedVoucher.code, {
      width: 500,
      margin: 1,
    });

  const qr = new window.Image();

    qr.src = qrData;

    await new Promise<void>((resolve, reject) => {
      qr.onload = () => resolve();
      qr.onerror = reject;
    });

    ctx.fillStyle = "#fff";
    ctx.fillRect(350, 350, 500, 500);

    ctx.drawImage(qr, 350, 350, 500, 500);

    // ---------- Text ----------
    ctx.textAlign = "center";

    ctx.fillStyle = "#f97316";
    ctx.font = "bold 88px Arial";

    ctx.fillText(
      `₱${selectedVoucher.amount} OFF`,
      canvas.width / 2,
      980
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 54px Arial";

    ctx.fillText(
      "E-VOUCHER",
      canvas.width / 2,
      1060
    );

    ctx.fillStyle = "#f97316";
    ctx.font = "bold 44px Arial";

    ctx.fillText(
      selectedVoucher.code,
      canvas.width / 2,
      1140
    );

    ctx.fillStyle = "#cccccc";
    ctx.font = "32px Arial";

    ctx.fillText(
      `Created: ${new Date(selectedVoucher.createdAt).toLocaleDateString()}`,
      canvas.width / 2,
      1230
    );

    ctx.fillText(
      `Valid Until: ${new Date(selectedVoucher.expiresAt).toLocaleDateString()}`,
      canvas.width / 2,
      1285
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Arial";

    // ctx.fillText(
    //   user.name,
    //   canvas.width / 2,
    //   1370
    // );

    // Warning
    ctx.fillStyle = "#ff4444";
    ctx.font = "bold 28px Arial";

    ctx.fillText(
      "Screenshots will not be entertained",
      canvas.width / 2,
      1550
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File(
        [blob],
        `PowerUp-Voucher-${selectedVoucher.code}.png`,
        {
          type: "image/png",
        }
      );

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "PowerUp Voucher",
          files: [file],
        });

        return;
      }

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = file.name;

      a.click();

      URL.revokeObjectURL(url);
    });

  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Download Failed",
      text: "Unable to generate voucher.",
    });
  }
};

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <Image src={newlogo} alt="PowerUp Rewards" width={130} height={40} />
        </div>

        <h1 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Gift size={20} className="text-[#e66a00]" /> My Vouchers
        </h1>

        {loading ? (
          <div className="flex justify-center items-center mt-10">
            <Loader2 className="animate-spin text-[#e66a00]" size={24} />
            <p className="ml-2 text-gray-400 text-sm">Loading vouchers...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <p className="text-gray-400 text-sm mt-10">You don’t have any vouchers yet.</p>
        ) : (
          <div className="w-full max-w-md space-y-4">
            {vouchers.map((voucher) => (
              <div
                key={voucher._id}
                onClick={() => !voucher.redeemed && setSelectedVoucher(voucher)}
                className={`bg-white/10 border border-white/10 rounded-2xl p-4 flex justify-between items-center transition ${
                  !voucher.redeemed ? "cursor-pointer hover:bg-white/15" : ""
                }`}
              >
                <div>
                  <p className="text-base font-semibold text-white">₱{voucher.amount} OFF</p>
                  <p className="text-xs text-gray-400 mb-1">
                    Code: <span className="text-[#e66a00]">{voucher.code}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires on{" "}
                    {new Date(voucher.expiresAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {voucher.redeemed ? (
                    <span className="flex items-center text-green-400 text-sm font-semibold">
                      <CheckCircle size={16} className="mr-1" /> Claimed
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-400 text-sm font-semibold">
                      <Clock size={16} className="mr-1" /> Not Claimed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Voucher Popup */}
        {selectedVoucher && user && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-[60]">
            {/* Blurred QR background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-lg">
              <QRCodeSVG
                value={selectedVoucher.code}
                size={300}
                fgColor="#ffffff"
                bgColor="#000000"
              />
            </div>
            {/* Foreground Card */}
            <div
              id="voucherCard"
              className="relative bg-neutral-900 text-white rounded-2xl p-6 shadow-2xl w-80 text-center border border-orange-500/30"
            >
              <button
                onClick={() => setSelectedVoucher(null)}
                className="absolute -top-3 -right-3 z-20 bg-black rounded-full p-2"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex justify-center mb-4">
                <img
                  src={POWERUP_LOGO}
                  alt="PowerUp Logo"
                  width={90}
                  height={90}
                  style={{
                    width: 90,
                    height: 90,
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* QR */}
              <div
                id="voucherQRContainer"
                className="relative z-10 flex flex-col items-center justify-center mb-4 bg-white p-4 rounded-xl shadow-md"
              >
                <QRCodeSVG
                  value={selectedVoucher.code}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              {/* Voucher Details */}
              <p className="text-3xl font-bold text-orange-500 mb-1">
                ₱{selectedVoucher.amount} OFF
              </p>
              <p className="text-lg font-semibold text-white tracking-widest mb-2">E-Voucher</p>
              <p className="text-base font-semibold text-orange-500 mb-3">
                Code: {selectedVoucher.code}
              </p>
              <p className="text-xs text-gray-400 mb-1">
                Created on:{" "}
                {new Date(selectedVoucher.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })}
              </p>
              <p className="text-xs text-gray-400 mb-1">
                Valid until{" "}
                {new Date(selectedVoucher.expiresAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })}
              </p>
              <p className="text-sm font-medium text-white">{user?.name}</p>

              {/* Divider */}
              <div className="border-t border-white/20 my-4" />

              {/* Warning */}
              <p className="text-xs text-red-400 font-semibold px-2">
                ⚠️ Screenshots will not be entertained by the cashier.
              </p>

              {/* Buttons */}
              <div className="flex justify-center gap-3 mt-5 z-10">
                <button
                  onClick={handleDownloadVoucher}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg shadow transition"
                >
                  Download Voucher
                </button>

                {/* <button
                  onClick={async () => {
                    try {
                      const shareData = {
                        title: "PowerUp E-Voucher",
                        text: `Here’s my PowerUp voucher worth ₱${selectedVoucher.amount}. Code: ${selectedVoucher.code}`,
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
                </button> */}
              </div>
            </div>
          </div>
        )}
      </main>
    </LayoutWithNav>
  );
}
