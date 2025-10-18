"use client";

import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import logo2 from "../../../public/assets/logo/powerup-logo-2.png";

export default function AccountSecurityPage() {
  return (
    <LayoutWithNav>
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={logo2} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Account Security</h1>
          {/* <form className="space-y-4 bg-white p-4 shadow rounded">
            <div>
              <label className="block text-gray-700">Change Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                placeholder="New Password"
              />
            </div>
            <div>
              <label className="block text-gray-700">Change Mobile Number</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                placeholder="09123456789"
              />
            </div>
            <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
              Save Changes
            </button>
          </form> */}
        </div>
      </main>
    </LayoutWithNav>
  );
}
