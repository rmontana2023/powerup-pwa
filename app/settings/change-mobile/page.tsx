// app/settings/change-mobile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import Swal from "sweetalert2";
import Image from "next/image";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";

interface User {
  _id: string;
  name: string;
  phone: string;
}
export default function ChangeMobilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobile, setMobile] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setMobile(parsed.phone); // show current phone in the input field
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      Swal.fire("Error", "Please enter a valid mobile number.", "error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "Unauthorized", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/settings/change-mobile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Success", "Mobile number updated successfully!", "success");
        if (user) {
          const updatedUser = { ...user, phone: mobile };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        Swal.fire("Error", data.error || "Update failed", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 pt-12 pb-24">
        {/* Header / Logo */}
        <div className="mb-8 flex justify-center">
          <Image src={newlogo} alt="PowerUp Rewards" width={160} height={50} priority />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md bg-[#0a0a0a] p-6 rounded-lg shadow-md">
          <h1 className="text-2xl text-[var(--accent)] font-bold mb-4">Change Mobile Number</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col">
              <span className="text-gray-400 mb-1">New Mobile Number</span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your new mobile number"
                className="px-3 py-2 rounded-md bg-[#111] text-[#fafafa] border border-[#222] focus:border-powerup-500 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--accent)] hover:bg-powerup-600 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Updating..." : "Update Mobile Number"}
            </button>
          </form>
        </div>
      </main>
    </LayoutWithNav>
  );
}
