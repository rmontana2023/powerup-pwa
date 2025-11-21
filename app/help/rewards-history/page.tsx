"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";

interface User {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
}

export default function RewardsHistoryPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to load user from localStorage:", err);
      }
    }

    loadUser();
  }, []);
  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>
        <div className="p-6">
          <h1 className="text-2xl text-[var(--accent)] font-bold mb-4">Rewards & Redeem History</h1>
          <p className="text-white-700 mb-4">
            Here you can see how to generate your rewards and check your points history.
          </p>
          {/* Example table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray shadow rounded">
              <thead className="bg-white-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Points</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3">2025-10-18</td>
                  <td className="p-3">Purchased Fuel</td>
                  <td className="p-3">120</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </LayoutWithNav>
  );
}
