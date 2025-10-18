"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { X, User } from "lucide-react";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";
import LayoutWithNav from "../components/LayoutWithNav";
interface Transaction {
  _id: string;
  liters: number;
  amount: number;
  pointsEarned: number;
  taggedAt: string;
  stationId?: { name: string };
}

interface Redemption {
  _id: string;
  description: string;
  points: number;
  createdAt: string;
  stationId?: string;
}
interface User {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
}

interface Voucher {
  code: string;
  amount: number;
  expiresAt: Date;
}
export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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

  const openNavQR = () => {
    if (!user) {
      alert("User not loaded yet. Please log in again.");
      router.push("/login");
      return;
    }

    setVoucher({
      code: user.qrCode, // ✅ safe now
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
              {/* <p className="text-sm font-medium text-gray-700">Amount: ₱{voucher.amount}</p> */}
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
