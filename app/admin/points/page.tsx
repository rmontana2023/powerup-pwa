"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function PointsConversionPage() {
  const [points, setPoints] = useState<string>("1");
  const [liters, setLiters] = useState<string>("1");
  const [loading, setLoading] = useState(false);

  // Fetch current conversion
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/points-conversion");
        const data = await res.json();
        setPoints(data.points.toString());
        setLiters(data.liters.toString());
      } catch (err) {
        toast.error("Failed to load current conversion.");
      }
    }
    loadData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/points-conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: parseFloat(points),
          liters: parseFloat(liters),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        toast.success("✅ Conversion updated successfully!");
      } else {
        toast.error(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("❌ Failed to update conversion.");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 bg-neutral-900 text-white p-6 rounded-xl border border-gray-700 shadow-lg relative">
      <Toaster position="top-right" reverseOrder={false} />

      <h2 className="text-xl font-semibold text-center mb-4">🔧 Points Conversion Settings</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Points</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Liters</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 py-2 rounded-lg font-semibold transition"
        >
          {loading ? "Updating..." : "Update Conversion"}
        </button>
      </form>

      <p className="text-xs text-center text-gray-500 mt-3">
        Current: {liters} Liter(s) = {points} Point(s)
      </p>
    </div>
  );
}
