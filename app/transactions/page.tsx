"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LayoutWithNav from "../components/LayoutWithNav";
import newlogo from "../../public/assets/logo/powerup-new-logo.png";

interface Transaction {
  _id: string;
  liters?: number;
  amount?: number;
  points: number;
  date: string;
  type: "Transaction" | "Redemption" | "Locked";
  description?: string;
  station?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
}

interface TransactionCardProps {
  item: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ item }) => {
  const color =
    item.type === "Transaction" ? "green-400" : item.type === "Locked" ? "yellow-400" : "red-400";

  return (
    <div
      className={`flex justify-between items-center p-3 rounded-xl border transition-all duration-200 border-${color}/20 bg-${color}/10 hover:bg-${color}/20`}
    >
      <div className="flex flex-col">
        <span className={`text-sm font-semibold text-${color}`}>{item.type}</span>
        <span className="text-xs text-gray-300">
          {item.type === "Transaction"
            ? `${item.liters ?? 0}L • ₱${item.amount ?? 0}`
            : item.description ?? "Points redeemed"}
        </span>
        <span className="text-[11px] text-gray-500">{new Date(item.date).toLocaleString()}</span>
      </div>
      <div className="text-right">
        <span className={`block text-sm font-bold text-${color}`}>
          {item.points >= 0 ? `+${item.points}` : item.points} pts
        </span>
        <span className="text-[11px] text-gray-400">{item.station || "Station"}</span>
      </div>
    </div>
  );
};

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  // Fetch logged-in user
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

  // Fetch transactions + redemptions + locked points
  useEffect(() => {
    async function fetchData() {
      try {
        const customerId =
          localStorage.getItem("customerId") || sessionStorage.getItem("customerId");
        if (!customerId) return;

        const res = await fetch(`/api/transactions/me?customerId=${customerId}`);
        const data = await res.json();

        // Assume backend returns merged array with type: Transaction | Redemption | Locked
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter transactions by date
  const filtered = useMemo(() => {
    if (filter === "all") return transactions;

    const now = new Date();
    let cutoff: Date | null = null;

    switch (filter) {
      case "yesterday":
        cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 1);
        return transactions.filter(
          (t) => new Date(t.date).toDateString() === cutoff!.toDateString()
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

    return transactions.filter((t) => new Date(t.date) >= cutoff!);
  }, [transactions, filter]);

  // Request full history via email
  const requestFullHistory = async () => {
    if (!user?.email) return alert("No email found.");
    const customerId = localStorage.getItem("customerId") || sessionStorage.getItem("customerId");
    if (!customerId) return;

    const res = await fetch(
      `/api/transactions/me?customerId=${customerId}&export=true&email=${encodeURIComponent(
        user.email
      )}`
    );
    const data = await res.json();
    alert(data.message || "Request sent successfully!");
  };

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={160} height={50} priority />
        </div>

        {/* Transaction History */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl shadow-lg p-5 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--accent)]">Transaction History</h2>
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
                <TransactionCard key={item._id} item={item} />
              ))}
            </div>
          )}

          {filtered.length >= 100 && (
            <div className="text-center mt-4">
              <button
                onClick={requestFullHistory}
                className="mt-2 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-xl transition-all"
              >
                Request Full History via Email
              </button>
            </div>
          )}
        </div>
      </main>
    </LayoutWithNav>
  );
}
