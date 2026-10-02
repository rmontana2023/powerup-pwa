"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";
interface User {
  _id: string;
  name: string;
  email: string;
  qrCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  birthDate: string;
}
export default function PersonalDetailsPage() {
  const [customer, setCustomer] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState({ firstName: "", middleName: "", lastName: "", phone: "", birthDate: "" });

  function startEditing() {
    if (!customer) return;
    setDraft({ firstName: customer.firstName, middleName: customer.middleName || "",
      lastName: customer.lastName, phone: customer.phone, birthDate: customer.birthDate?.split("T")[0] || "" });
    setError("");
    setMessage("");
    setEditing(true);
  }

  async function saveDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/customer/me", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save personal details");
      setCustomer(data.customer);
      setEditing(false);
      setMessage("Personal details saved.");
      const updatedUser = { ...user, ...data.customer,
        name: [data.customer.firstName, data.customer.middleName, data.customer.lastName].filter(Boolean).join(" ") };
      setUser(updatedUser);
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("customerName", updatedUser.name);
        localStorage.setItem("customerMobile", updatedUser.phone);
      } catch {
        // The account was saved even if this device cannot cache it.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save personal details");
    } finally {
      setSaving(false);
    }
  }

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
        if (!res.ok) throw new Error(data.error || "Unable to load personal details");
        setCustomer(data.customer);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load personal details");
      } finally {
        setLoading(false);
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
          {loading && <p className="text-gray-600" role="status">Loading personal details…</p>}
          {error && <p className="text-red-600" role="alert">{error}</p>}
          {message && <p className="text-green-700" role="status">{message}</p>}
          {editing ? (
            <form onSubmit={saveDetails} className="space-y-4">
              <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
                {([
                  ["firstName", "First Name", "text", "given-name"],
                  ["middleName", "Middle Name (optional)", "text", "additional-name"],
                  ["lastName", "Last Name", "text", "family-name"],
                  ["phone", "Mobile Number", "tel", "tel-national"],
                  ["birthDate", "Birthdate", "date", "bday"],
                ] as const).map(([field, label, type, autoComplete]) => (
                  <label key={field} className="block text-sm font-medium text-gray-700">
                    {label}
                    <input type={type} autoComplete={autoComplete} value={draft[field]}
                      required={field !== "middleName"} maxLength={field === "phone" ? 11 : 100}
                      pattern={field === "phone" ? "09[0-9]{9}" : undefined}
                      placeholder={field === "phone" ? "09XXXXXXXXX" : undefined}
                      onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:outline-orange-500" />
                  </label>
                ))}
                <div className="flex gap-3">
                  <button type="submit" className="rounded-lg bg-orange-500 px-4 py-3 font-semibold text-black">{saving ? "Saving…" : "Save changes"}</button>
                  <button type="button" onClick={() => { setEditing(false); setError(""); }} className="rounded-lg bg-gray-100 px-4 py-3 text-gray-800">Cancel</button>
                </div>
              </fieldset>
            </form>
          ) : customer && (
            <>
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
          <button type="button" onClick={startEditing} className="w-full rounded-lg bg-orange-500 p-3 font-semibold text-black">Edit personal details</button>
          <Link href="/settings/change-email" className="block text-center text-sm">Change email address</Link>
            </>
          )}
        </div>
      </main>
    </LayoutWithNav>
  );
}

/* ------------------------------ */
/* Reusable Detail Display Item   */
/* ------------------------------ */

function DetailItem({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-500 font-medium">{label}</p>

      <p className="mt-1 text-base font-semibold text-gray-800 bg-gray-100 p-3 rounded-lg">
        {value || "—"}
      </p>
    </div>
  );
}
