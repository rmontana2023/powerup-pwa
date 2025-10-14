"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { List, Home, Gift, User, QrCode } from "lucide-react";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center relative h-16">
          <div className="flex space-x-6">
            <NavItem
              label="Home"
              icon={<Home className="w-6 h-6" />}
              onClick={() => router.push("/dashboard")}
            />
            <NavItem
              label="Transactions"
              icon={<List className="w-6 h-6 text-orange-500" />}
              onClick={() => router.push("/transactions")}
            />
          </div>
          <button
            onClick={() => router.push("/dashboard?showQr=true")}
            className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-orange-600 transition"
          >
            <QrCode className="w-7 h-7" />
          </button>

          <div className="flex space-x-6">
            <NavItem
              label="Rewards"
              icon={<Gift className="w-6 h-6" />}
              onClick={() => router.push("/rewards")}
            />
            <NavItem
              label="Account"
              icon={<User className="w-6 h-6" />}
              onClick={() => router.push("/account")}
            />
          </div>
        </div>
      </nav>
    </main>
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
