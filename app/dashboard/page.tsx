"use client";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { X, Wallet, Clock, Bike, Truck, Home, List, Gift, User, QrCode } from "lucide-react";
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // QR / Redeem state
  const [qrOpen, setQrOpen] = useState(false);
  const [showSlideDialog, setShowSlideDialog] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [redeemTimer, setRedeemTimer] = useState(30);
  const redeemTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStart = useRef(0);
  const [voucher, setVoucher] = useState<any | null>(null);
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
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
  const revealVoucher = async () => {
    if (!canRedeem || loadingVoucher) return;

    setLoadingVoucher(true);
    try {
      const res = await fetch("/api/vouchers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user._id,
          amount: userTiers.find((tier) => user.totalPoints >= tier.points)?.peso || 0,
          points: userTiers.find((tier) => user.totalPoints >= tier.points)?.points || 0,
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
  const openNavQR = () => {
    console.log("🚀 ~ openNavQR ~ user:", user);
    setVoucher({
      code: user.qrCode, // or `${user._id}:${user.name}` for example
      amount: 0,
      expiresAt: new Date(Date.now() + 30 * 1000),
    });
    setQrOpen(true);
    setRedeemTimer(30);
  };
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <LayoutWithNav openNavQR={openNavQR}>
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

        {/* Slide-to-Show QR */}
        {showSlideDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-80 text-center relative">
              <X
                className="absolute top-3 right-3 w-5 h-5 text-gray-500 cursor-pointer"
                onClick={() => setShowSlideDialog(false)}
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Slide to Reveal QR</h3>
              <div
                ref={sliderRef}
                className="relative w-full h-12 bg-gray-200 rounded-full overflow-hidden select-none touch-none"
                onPointerDown={startDrag}
                onPointerMove={onDrag}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${sliderWidth}%` }}
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-semibold">
                  Slide to Redeem
                </span>
              </div>
            </div>
          </div>
        )}

        {qrOpen && voucher && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-80 text-center relative">
              <button
                onClick={() => setQrOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">My e-Voucher</h3>
              <div className="flex justify-center mb-3">
                <QRCodeSVG value={voucher.code} size={160} bgColor="#fff" fgColor="#000" />
              </div>
              <p className="text-xs text-gray-600 mb-1">Voucher Code: {voucher.code}</p>
              <p className="text-sm font-medium text-gray-700">Amount: ₱{voucher.amount}</p>
              <p className="text-xs text-gray-500">
                Expires: {new Date(voucher.expiresAt).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-gray-700 mt-2">
                Expires in: {redeemTimer} sec
              </p>
            </div>
          </div>
        )}
      </main>
    </LayoutWithNav>
  );
}

function MenuItem({ label, icon }: { label: string; icon: JSX.Element }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/70 backdrop-blur-lg p-4 rounded-2xl shadow hover:scale-105 hover:bg-orange-50 transition cursor-pointer">
      <div className="mb-2 text-orange-500">{icon}</div>
      <span className="text-xs font-medium text-gray-800">{label}</span>
    </div>
  );
}

function NavItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-500 transition"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
