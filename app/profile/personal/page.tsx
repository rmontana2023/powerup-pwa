"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";
interface User {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
}
export default function PersonalDetailsPage() {
  const [customer, setCustomer] = useState<any>(null);
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

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch("/api/customer/me");
        const data = await res.json();
        setCustomer(data.customer);
      } catch (error) {
        console.log("⚠️ Error loading customer:", error);
      }
    };

    fetchCustomer();
  }, []);

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] to-white flex flex-col items-center px-4 py-6 pb-24">
        {/* Header Logo */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-[var(--accent)] text-center mb-4 w-full max-w-md">
          Personal Details
        </h1>

        {/* Details Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-5 border border-gray-100 space-y-4">
          <DetailItem label="First Name" value={customer?.firstName} />

          <DetailItem label="Middle Name" value={customer?.middleName} />

          <DetailItem label="Last Name" value={customer?.lastName} />

          <DetailItem label="Mobile Number" value={customer?.phone} />

          <DetailItem label="Email Address" value={customer?.email} />

          <DetailItem
            label="Birthdate"
            value={
              customer?.birthDate
                ? customer.birthDate.split("T")[0] // YYYY-MM-DD
                : "—"
            }
          />
        </div>
      </main>
    </LayoutWithNav>
  );
}

/* ------------------------------ */
/* Reusable Detail Display Item   */
/* ------------------------------ */

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-500 font-medium">{label}</p>

      <p className="mt-1 text-base font-semibold text-gray-800 bg-gray-100 p-3 rounded-lg">
        {value || "—"}
      </p>
    </div>
  );
}
