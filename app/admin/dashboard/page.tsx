"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    customers: number;
    transactions: number;
    points: number;
  } | null>(null);
  const [trends, setTrends] = useState<unknown[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/admin/stats", {
        credentials: "include",
      });

      if (res.ok) setStats(await res.json());
      else console.log("Stats error:", await res.text());
    }

    async function fetchTrends() {
      const res = await fetch("/api/admin/stats/trends", {
        credentials: "include",
      });

      if (res.ok) setTrends(await res.json());
      else console.log("Trends error:", await res.text());
    }

    fetchStats();
    fetchTrends();
  }, []);

  if (!stats) return <p className="text-gray-400">Loading dashboard...</p>;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white rounded-xl shadow-sm p-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome</h1>
          {/* <p className="text-sm text-gray-500 capitalize">{user?.role} Dashboard</p> */}
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border rounded-lg px-4 py-2 text-sm shadow-sm"
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      {/* ADMIN DASHBOARD */}
      {user?.role === "admin" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card title="Customers" value={stats?.customers ?? 0} color="blue" />
            <Card title="Transactions" value={stats?.transactions ?? 0} color="green" />
            <Card title="Points" value={stats?.points ?? 0} color="yellow" />
            <Card
              title="Revenue"
              value={`₱${data?.totalRevenue?.toLocaleString() ?? 0}`}
              color="purple"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <ChartCard title="Customers Growth">
              <LineChart data={trends as TrendData[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="customers" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ChartCard>

            <ChartCard title="Transactions Growth">
              <LineChart data={trends as TrendData[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="transactions" stroke="#16a34a" strokeWidth={3} />
              </LineChart>
            </ChartCard>

            <ChartCard title="Points Growth">
              <LineChart data={trends as TrendData[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="points" stroke="#ca8a04" strokeWidth={3} />
              </LineChart>
            </ChartCard>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Transactions</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="text-left py-3">Order No</th>
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentTransactions?.map((tx) => (
                    <tr key={tx.order_no} className="border-b hover:bg-gray-50">
                      <td className="py-3">{tx.order_no}</td>
                      <td>{formatDate(tx)}</td>
                      <td>₱{tx.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* CASHIER DASHBOARD */}
      {user?.role === "cashier" && (
        <>
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => router.push("/dashboard/cashier/scan")}
          >
            Scan QR Code
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="My Sales">
              <LineChart data={data?.chartData.transactions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="amount" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ChartCard>

            <ChartCard title="Points Earned">
              <BarChart data={data?.chartData.transactions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#16a34a" />
              </BarChart>
            </ChartCard>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold mb-4 text-gray-800">Your Recent Transactions</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th>Order No</th>
                    <th>Date</th>
                    <th>Points</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentTransactions?.map((tx) => (
                    <tr key={tx.order_no} className="border-b hover:bg-gray-50">
                      <td>{tx.order_no}</td>
                      <td>{formatDate(tx)}</td>
                      <td>{tx.pointsEarned?.toFixed(2)}</td>
                      <td>₱{tx.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Reusable Card */
function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-md">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}

/* Reusable Chart Wrapper */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        {children as any}
      </ResponsiveContainer>
    </div>
  );
}
