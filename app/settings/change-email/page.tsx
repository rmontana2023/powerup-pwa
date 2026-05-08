// app/settings/change-email/page.tsx
"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutWithNav from "@/app/components/LayoutWithNav";
import Swal from "sweetalert2";
import Image from "next/image";
import newlogo from "../../../public/assets/logo/powerup-new-logo.png";

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function ChangeEmailPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMode, setOtpMode] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      Swal.fire("Error", "Please enter a valid email address.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "Unauthorized", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newEmail: email,
          password,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpMode(true);

        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: "We sent a verification code to your new email.",
        });
      } else {
        Swal.fire("Error", data.error || "Update failed", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/settings/verify-email-change", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp }),
    });

    const data = await res.json();

    if (res.ok) {
      await Swal.fire({
        icon: "success",
        title: "Email Updated",
        text: "Please login again.",
      });

      // ✅ FORCE LOGOUT
      localStorage.removeItem("user");
      localStorage.removeItem("customerId");
      localStorage.removeItem("token");

      localStorage.clear();

      // ✅ Redirect to login
      window.location.href = "/login";
    } else {
      Swal.fire({
        icon: "error",
        title: "OTP Error",
        text: data.error,
      });
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
          <h1 className="text-2xl text-[var(--accent)] font-bold mb-4">Change Email Address</h1>

          {/* CURRENT EMAIL */}
          <div className="mb-4 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Current Email</p>
            <p className="text-sm text-white break-all">{user?.email || "No email found"}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* NEW EMAIL */}
            <label className="flex flex-col">
              <span className="text-gray-400 mb-1">New Email Address</span>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your new email"
                disabled={otpMode}
                className="px-3 py-2 rounded-md bg-[#111] text-[#fafafa] border border-[#222]
        focus:border-powerup-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>

            {/* PASSWORD */}
            <label className="flex flex-col">
              <span className="text-gray-400 mb-1">Current Password</span>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={otpMode}
                  className="w-full px-3 py-2 pr-10 rounded-md bg-[#111] text-[#fafafa]
          border border-[#222] focus:border-powerup-500 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={otpMode}
                  className="absolute right-3 top-1/2 -translate-y-1/2
          text-gray-500 hover:text-gray-300 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {/* UPDATE BUTTON */}
            <button
              type="submit"
              disabled={loading || otpMode}
              className="bg-[var(--accent)] hover:bg-powerup-600
      disabled:bg-gray-600 disabled:cursor-not-allowed
      text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Sending OTP..." : otpMode ? "Verification In Progress" : "Update Email"}
            </button>
          </form>

          {/* OTP SECTION */}
          {otpMode && (
            <div className="mt-6 border-t border-[#222] pt-4 flex flex-col gap-4">
              <div>
                <p className="text-sm text-green-500 font-medium">Verification Required</p>

                <p className="text-xs text-gray-400 mt-1">We sent a 6-digit OTP to:</p>

                <p className="text-sm text-white break-all">{email}</p>
              </div>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="px-3 py-2 rounded-md bg-[#111]
        text-[#fafafa] border border-[#222]
        focus:border-green-500 focus:outline-none"
              />

              <button
                onClick={handleVerifyOtp}
                className="bg-green-600 hover:bg-green-700
        text-white py-2 rounded-lg font-semibold transition"
              >
                Verify OTP
              </button>
            </div>
          )}
        </div>
      </main>
    </LayoutWithNav>
  );
}
