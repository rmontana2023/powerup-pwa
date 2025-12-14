"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Customer {
  _id: string;
  // name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  totalPoints: number;
  accountType: string;
  createdAt: string;
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchCustomers();
  }, [page, sortField, sortOrder, search]);

  async function fetchCustomers() {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortField,
      sortOrder,
      search,
    });
    const res = await fetch(`/api/admin/customers?${params.toString()}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setTotal(data.total || 0);
  }

  async function handleAccountTypeChange(id: string, newType: string, oldType: string) {
    // Show confirmation dialog
    const confirm = window.confirm(
      `Are you sure you want to change this customer's account type from "${oldType}" to "${newType}"?`
    );
    if (!confirm) return;

    // Update API
    const res = await fetch("/api/admin/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, accountType: newType }),
    });

    if (res.ok) {
      toast.success("Account type updated successfully!");
      fetchCustomers();
    } else {
      toast.error("Failed to update account type.");
    }
  }

  return (
    <div className="p-4 text-white">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <input
          type="text"
          placeholder="Search name, email, or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded bg-gray-900 border border-gray-700 text-sm w-full sm:w-1/3 placeholder-gray-500"
        />

        <div className="flex gap-2 text-sm">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-3 py-2 rounded"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="createdAt">Created</option>
            <option value="totalPoints">Points</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="bg-gray-900 border border-gray-700 px-3 py-2 rounded"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-lg shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2 text-center">Total Points</th>
              <th className="px-4 py-2 text-center">Account Type</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-t border-gray-700 hover:bg-gray-800/50 transition">
                <td className="px-4 py-2">
                  {c.firstName} {c.middleName} {c.lastName}
                </td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">{c.phone}</td>
                <td className="px-4 py-2 text-center">{c.totalPoints.toFixed(2)}</td>
                <td className="px-4 py-2 text-center capitalize">{c.accountType}</td>
                <td className="px-4 py-2 text-center flex justify-center items-center gap-2">
                  <select
                    value={c.accountType}
                    onChange={(e) => handleAccountTypeChange(c._id, e.target.value, c.accountType)}
                    className="bg-gray-900 border border-gray-700 px-2 py-1 rounded text-xs"
                  >
                    <option value="ordinary">Ordinary</option>
                    <option value="fleet">Fleet</option>
                  </select>
                  <Edit3 className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <span className="text-sm text-gray-400">
          Page {page} of {totalPages || 1}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
