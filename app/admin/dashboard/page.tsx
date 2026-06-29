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
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Dashboard Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl shadow-md">
          <p className="text-gray-400 text-sm">Total Customers</p>
          <p className="text-2xl font-bold">{stats.customers}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl shadow-md">
          <p className="text-gray-400 text-sm">Total Transactions</p>
          <p className="text-2xl font-bold">{stats.transactions}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl shadow-md">
          <p className="text-gray-400 text-sm">Total Points</p>
          <p className="text-2xl font-bold">{stats.points}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Customers Added</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="customers" stroke="#38bdf8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Transactions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="transactions" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Points Earned</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="points" stroke="#facc15" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
