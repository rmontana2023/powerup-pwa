"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Redemption = {
  _id: string;
  createdAt: string;
  points: number;
  amount: number;
  type: "locked" | "redeemed";
  description?: string;
  customerId: { firstName: string; lastName: string };
};

export default function RedemptionReportPage() {
  const [data, setData] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    type: "",
  });

  const fetchData = async () => {
    setLoading(true);

    const params = new URLSearchParams(filters as any);

    const res = await fetch(`/api/admin/reports/redemptions?${params}`);
    console.log("Response:", res); // Log the response object
    const json = await res.json();

    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Redemption Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Date", "Customer", "Type", "Points", "Amount", "Description"]],
      body: data.map((r) => [
        new Date(r.createdAt).toLocaleString(),
        r.customerId?.firstName + " " + r.customerId?.lastName,
        r.type,
        r.points,
        r.amount,
        r.description || "-",
      ]),
    });

    doc.save("redemptions.pdf");
  };

  return (
    <div className="space-y-4 text-white">
      <h1 className="text-xl md:text-2xl font-bold">Redemption Report</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#111] p-4 rounded-lg">
        <input
          type="date"
          className="w-full p-2 bg-white text-black border border-gray-700 rounded"
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />

        <input
          type="date"
          className="w-full p-2 bg-white text-black border border-gray-700 rounded"
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />

        <select
          className="w-full p-2 bg-white text-black border border-gray-700 rounded"
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="locked">Locked</option>
          <option value="redeemed">Redeemed</option>
        </select>

        <button
          onClick={fetchData}
          className="w-full sm:col-span-2 lg:col-span-1 bg-blue-600 px-4 py-2 rounded"
        >
          Apply Filters
        </button>

        <button
          onClick={exportPDF}
          className="w-full sm:col-span-2 lg:col-span-1 bg-green-600 px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      {/* ========================= */}
      {/* DESKTOP TABLE VIEW */}
      {/* ========================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border border-gray-800">
          <thead className="bg-[#111]">
            <tr>
              <th className="p-2">Date</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Points</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr key={r._id} className="border-t border-gray-800 text-center">
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.customerId?.firstName}</td>
                  <td>{r.type}</td>
                  <td>{r.points}</td>
                  <td>{r.amount}</td>
                  <td>{r.description || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================= */}
      {/* MOBILE CARD VIEW */}
      {/* ========================= */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          data.map((r) => (
            <div key={r._id} className="bg-[#111] p-4 rounded-lg border border-gray-800 space-y-1">
              <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>

              <div className="font-semibold">
                {r.customerId?.firstName} {r.customerId?.lastName}
              </div>

              <div className="flex justify-between text-sm">
                <span>Type</span>
                <span className="capitalize">{r.type}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Points</span>
                <span>{r.points}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span>₱{r.amount}</span>
              </div>

              <div className="text-sm text-gray-300">{r.description || "-"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
