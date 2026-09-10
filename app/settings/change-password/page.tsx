"use client";
import { useState, useEffect, useRef } from "react";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import Swal from "sweetalert2";
import { getPasswordError, PASSWORD_REQUIREMENTS } from "@/lib/password-validation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";

export default function ChangePasswordPage() {
  const submitting = useRef(false);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("user"); }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting.current) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire("Error", "Please fill in all fields.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "New password and confirmation do not match.", "error");
      return;
    }

    const passwordError = getPasswordError(newPassword);
    if (passwordError || newPassword === currentPassword) {
      Swal.fire("Error", passwordError || "New password must differ from your current password.", "error");
      return;
    }

    submitting.current = true;
    setLoading(true);

    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        localStorage.removeItem("user");
        localStorage.removeItem("customerId");
        localStorage.removeItem("token");
        await Swal.fire("Success", "Password updated successfully! Please log in again.", "success");
        window.location.replace("/login");
      } else {
        Swal.fire("Error", data.error || "Update failed", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <LayoutWithNav user={user}>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center px-4 pt-12 pb-24">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src={newlogo} alt="PowerUp Rewards" width={160} height={50} priority />
        </div>

        <div className="w-full max-w-md bg-[#0a0a0a] p-6 rounded-lg shadow-md">
          <h1 className="text-2xl text-[var(--accent)] font-bold mb-4">Change Password</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* CURRENT PASSWORD */}
            <label className="flex flex-col relative">
              <span className="text-gray-400 mb-1">Current Password</span>
              <input
                type={showCurrent ? "text" : "password"}
                required
                disabled={loading}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="px-3 py-2 rounded-md bg-[#111] text-[#fafafa] border border-[#222] 
                focus:border-powerup-500 focus:outline-none pr-12"
              />
              <button
                type="button"
                aria-label={showCurrent ? "Hide password" : "Show password"}
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 mt-3 top-[36px] transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>

            {/* NEW PASSWORD */}
            <label className="flex flex-col relative">
              <span className="text-gray-400 mb-1">New Password</span>
              <input
                type={showNew ? "text" : "password"}
                required
                disabled={loading}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="px-3 py-2 rounded-md bg-[#111] text-[#fafafa] border border-[#222] 
                focus:border-powerup-500 focus:outline-none pr-12"
              />
              <button
                type="button"
                aria-label={showNew ? "Hide password" : "Show password"}
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 mt-3 top-[36px] transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>

            <p className="text-sm text-gray-400">{PASSWORD_REQUIREMENTS} Maximum 72 characters.</p>

            {/* CONFIRM PASSWORD */}
            <label className="flex flex-col relative">
              <span className="text-gray-400 mb-1">Confirm New Password</span>
              <input
                type={showConfirm ? "text" : "password"}
                required
                disabled={loading}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="px-3 py-2 rounded-md bg-[#111] text-[#fafafa] border border-[#222] 
                focus:border-powerup-500 focus:outline-none pr-12"
              />
              <button
                type="button"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 mt-3 top-[36px] transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--accent)] hover:bg-powerup-700 text-white font-semibold py-3 rounded-lg 
               transition shadow-lg shadow-powerup-600/30"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </LayoutWithNav>
  );
}
