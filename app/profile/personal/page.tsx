"use client";
import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import logo2 from "../../../public/assets/logo/powerup-logo-2.png";

export default function PersonalDetailsPage() {
  return (
    <LayoutWithNav>
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={logo2} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Personal Details</h1>
          {/* <form className="space-y-4 bg-white p-4 shadow rounded">
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                placeholder="johndoe@example.com"
              />
            </div>
            <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
              Save
            </button>
          </form> */}
        </div>
      </main>
    </LayoutWithNav>
  );
}
