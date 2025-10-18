"use client";

import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import logo2 from "../../../public/assets/logo/powerup-logo-2.png";

export default function RewardsHistoryPage() {
  return (
    <LayoutWithNav>
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={logo2} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Rewards & Redeem History</h1>
          <p className="text-gray-700 mb-4">
            Here you can see how to generate your rewards and check your points history.
          </p>
          {/* Example table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-100">
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
