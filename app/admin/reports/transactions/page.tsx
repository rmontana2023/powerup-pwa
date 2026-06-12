"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Transaction = {
  _id: string;
  taggedAt: string;
  receiptNo: string;
  liters: number;
  amount: number;
  pointsEarned: number;
  source: string;
  customerId: { fullName: string };
  stationId: { name: string };
};

export default function TransactionReportPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    receiptNo: "",
    source: "",
  });

  const fetchData = async () => {
    setLoading(true);

    const params = new URLSearchParams(filters as any);

    const res = await fetch(`/api/admin/reports/transactions?${params}`);
    const json = await res.json();

    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Transaction Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Date", "Customer", "Receipt", "Liters", "Amount", "Points", "Source"]],
      body: data.map((t) => [
        new Date(t.taggedAt).toLocaleString(),
        t.customerId?.firstName + " " + t.customerId?.lastName,
        t.receiptNo,
        t.liters.toFixed(2),
        t.amount,
        t.pointsEarned,
        t.source,
      ]),
    });

    doc.save("transactions.pdf");
  };

  return (
    <div className="space-y-4 text-white">
      <h1 className="text-xl md:text-2xl font-bold">Transaction Report</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#111] p-4 rounded-lg">
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

        <input
          placeholder="Receipt No"
          className="w-full p-2 bg-white text-black border border-gray-700 rounded"
          onChange={(e) => setFilters({ ...filters, receiptNo: e.target.value })}
        />

        <select
          className="w-full p-2 bg-white text-black border border-gray-700 rounded"
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
        >
          <option value="">All Source</option>
          <option value="POS">POS</option>
          <option value="Manual">Manual</option>
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
              <th>Receipt</th>
              <th>Liters</th>
              <th>Amount</th>
              <th>Points</th>
              <th>Source</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : (
              data.map((t) => (
                <tr key={t._id} className="border-t border-gray-800 text-center">
                  <td className="p-2">{new Date(t.taggedAt).toLocaleString()}</td>
                  <td>
                    {t.customerId?.firstName} {t.customerId?.lastName}
                  </td>
                  <td>{t.receiptNo}</td>
                  <td>{t.liters.toFixed(2)}</td>
                  <td>{t.amount}</td>
                  <td>{t.pointsEarned}</td>
                  <td>{t.source}</td>
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
          data.map((t) => (
            <div key={t._id} className="bg-[#111] p-4 rounded-lg border border-gray-800 space-y-1">
              <div className="text-sm text-gray-400">{new Date(t.taggedAt).toLocaleString()}</div>

              <div className="font-semibold">
                {t.customerId?.firstName} {t.customerId?.lastName}
              </div>

              <div className="text-sm text-gray-300">
                Receipt: <span className="text-white">{t.receiptNo}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Liters</span>
                <span>{t.liters.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span>₱{t.amount}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Points</span>
                <span>{t.pointsEarned}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Source</span>
                <span>{t.source}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
