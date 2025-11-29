"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import Swal from "sweetalert2";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";

interface AdditionalInfoForm {
  province: string;
  city: string;
  barangay: string;
  street: string;
  zipCode: string;
}

export default function AdditionalInfoPage() {
  const [user, setUser] = useState<any | null>(null);
  const [form, setForm] = useState<AdditionalInfoForm>({
    province: "",
    city: "",
    barangay: "",
    street: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch saved additional info from backend
        const res = await fetch("/api/customer/me");
        const data = await res.json();
        if (data.customer) {
          // pre-fill form if info exists
          setForm({
            province: data.customer.province || "",
            city: data.customer.city || "",
            barangay: data.customer.barangay || "",
            street: data.customer.street || "",
            zipCode: data.customer.zipCode || "",
          });
        }
      } catch (err) {
        console.error("Failed to load user or customer info:", err);
      }
    }
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customer/additional-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save info");

      // Show Swal success popup
      Swal.fire({
        icon: "success",
        title: data.customer.province ? "Updated!" : "Saved!",
        text: "Your additional information has been successfully saved.",
        confirmButtonColor: "#f97316",
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: err.message || "Failed to save information",
        confirmButtonColor: "#f97316",
      });
      setError(err.message || "Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AdditionalInfoForm, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 py-6 pb-24">
        {/* Header Logo */}
        <div className="w-full max-w-md flex justify-center items-center mb-6">
          <Image src={newlogo} alt="PowerUp Rewards" width={150} height={50} priority />
        </div>

        {/* Page Title */}
        <h1 className="text-2xl text-[var(--accent)] text-center mb-6 w-full max-w-md font-bold">
          Additional Information
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4"
        >
          <InputField
            label="Province"
            value={form.province}
            onChange={(v) => handleChange("province", v)}
          />
          <InputField
            label="City/Municipality"
            value={form.city}
            onChange={(v) => handleChange("city", v)}
          />
          <InputField
            label="Barangay"
            value={form.barangay}
            onChange={(v) => handleChange("barangay", v)}
          />
          <InputField
            label="House/Building No. Street Name"
            value={form.street}
            onChange={(v) => handleChange("street", v)}
          />
          <InputField
            label="Zip Code"
            value={form.zipCode}
            onChange={(v) => handleChange("zipCode", v)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : form.province || form.city
              ? "Update Information"
              : "Save Information"}
          </button>
        </form>
      </main>
    </LayoutWithNav>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  );
}
