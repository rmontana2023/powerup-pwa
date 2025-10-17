"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { List, Home, Gift, User, QrCode } from "lucide-react";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";
import LayoutWithNav from "../components/LayoutWithNav";
export default function TransactionsPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState<any | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [redeemTimer, setRedeemTimer] = useState(30);
  const redeemTimerRef = useRef<NodeJS.Timeout | null>(null);
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
  useEffect(() => {
    async function fetchData() {
      try {
        // 🔹 Replace this with where you store your customer ID
        const customerId =
          localStorage.getItem("customerId") || sessionStorage.getItem("customerId");

        if (!customerId) {
          console.warn("No customerId found in storage!");
          setLoading(false);
          return;
        }

        const [txRes, rdRes] = await Promise.all([
          fetch(`/api/transactions/me?customerId=${customerId}`),
          fetch(`/api/redemptions/me?customerId=${customerId}`),
        ]);

        const txData = await txRes.json();
        const rdData = await rdRes.json();

        setTransactions(txData.transactions || []);
        setRedemptions(rdData.redemptions || []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const combined = [
    ...transactions.map((t) => ({
      _id: t._id,
      type: "Transaction",
      date: t.taggedAt,
      details: `${t.liters}L - ₱${t.amount}`,
      points: `+${t.pointsEarned} pts`,
      station: t.stationId?.name || "Station",
    })),
    ...redemptions.map((r) => ({
      _id: r._id,
      type: "Redemption",
      date: r.createdAt,
      details: r.description || "Points redeemed",
      points: `-${r.points} pts`,
      station: r.stationId || "Station",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) return <p className="text-center mt-10">Loading...</p>;
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
  return (
    <LayoutWithNav openNavQR={openNavQR}>
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={logo2} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>

        <div className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-orange-100 rounded-3xl shadow-lg p-5 mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Transaction History</h2>

          {combined.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-3 max-h-[65vh] overflow-y-auto">
              {combined.map((item) => (
                <div
                  key={item._id}
                  className={`flex justify-between items-center p-3 rounded-xl shadow-sm border ${
                    item.type === "Transaction"
                      ? "border-orange-100 bg-orange-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${
                        item.type === "Transaction" ? "text-orange-600" : "text-gray-700"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-600">{item.details}</span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`block text-sm font-bold ${
                        item.type === "Transaction" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {item.points}
                    </span>
                    <span className="text-[11px] text-gray-500">{item.station}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </LayoutWithNav>
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
