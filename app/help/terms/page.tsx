"use client";

import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import logo2 from "../../../public/assets/logo/powerup-logo-2.png";

export default function TermsPage() {
  return (
    <LayoutWithNav>
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={logo2} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-gray-700">
            These are the terms and conditions for using PowerUp rewards. Please read carefully.
          </p>
        </div>
      </main>
    </LayoutWithNav>
  );
}
