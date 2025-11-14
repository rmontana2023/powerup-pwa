"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import newlogo from "../../public/assets/logo/powerup-new-logo.png";
import LayoutWithNav from "../components/LayoutWithNav";
import SlideToRevealQR from "../components/SlideRevealQR";

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

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    }
    fetchUser();
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const customerId =
          localStorage.getItem("customerId") || sessionStorage.getItem("customerId");
        if (!customerId) return;

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

  // Combine transactions + redemptions
  const combined = useMemo(() => {
    return [
      ...transactions.map((t) => ({
        _id: t._id,
        type: "Transaction",
        date: t.taggedAt,
        details: `${t.liters}L • ₱${t.amount}`,
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
  }, [transactions, redemptions]);

  // ⏳ Filter logic
  const filtered = useMemo(() => {
    if (filter === "all") return combined;

    const now = new Date();
    let cutoff: Date | null = null;

    switch (filter) {
      case "yesterday":
        cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 1);
        return combined.filter(
          (item) => new Date(item.date).toDateString() === cutoff!.toDateString()
        );
      case "3days":
        cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 3);
        break;
      case "7days":
        cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 7);
        break;
      case "30days":
        cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 30);
        break;
    }

    return combined.filter((item) => new Date(item.date) >= cutoff!);
  }, [combined, filter]);

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={160} height={50} priority />
        </div>

        {/* Transaction Card */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg p-5 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--accent)]">Transaction History</h2>

            {/* 🔽 Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border border-white/20 text-sm text-gray-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="all">All</option>
              <option value="yesterday">Yesterday</option>
              <option value="3days">Last 3 Days</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 text-sm">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">No transactions found.</p>
          ) : (
            <div className="space-y-3 max-h-[65vh] overflow-y-auto">
              {filtered.map((item) => (
                <div
                  key={item._id}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all duration-200 ${
                    item.type === "Transaction"
                      ? "border-[var(--accent)]/20 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20"
                      : "border-red-400/20 bg-red-400/10 hover:bg-red-400/20"
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${
                        item.type === "Transaction" ? "text-[var(--accent)]" : "text-red-400"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-300">{item.details}</span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`block text-sm font-bold ${
                        item.type === "Transaction" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {item.points}
                    </span>
                    <span className="text-[11px] text-gray-400">{item.station}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filtered.length >= 100 && (
            <div className="text-center mt-4">
              <button
                onClick={async () => {
                  if (!user?.email) return alert("No email found.");
                  const res = await fetch(
                    `/api/transactions/me?customerId=${
                      user._id
                    }&export=true&email=${encodeURIComponent(user.email)}`
                  );
                  const data = await res.json();
                  alert(data.message || "Request sent successfully!");
                }}
                className="mt-2 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-xl transition-all"
              >
                Request Full History via Email
              </button>
            </div>
          )}
        </div>

        {user && <SlideToRevealQR user={user} />}
      </main>
    </LayoutWithNav>
  );
}
