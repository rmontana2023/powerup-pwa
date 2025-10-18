"use client";
import { useState } from "react";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    accountType: "ordinary",
  });
  const [error, setError] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        throw new Error("All required fields must be filled.");
      }

      if (!/\S+@\S+\.\S+/.test(form.email)) {
        throw new Error("Please enter a valid email address.");
      }

      if (form.password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setUserId(data.userId);
      setOtpMode(true);
      setSuccessMsg("We’ve sent a 6-digit OTP to your email. Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Error encountered");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      setSuccessMsg("✅ OTP verified successfully!");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Error on verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 animate-fadeIn">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src={logo2} alt="PowerUp Rewards" width={250} height={80} priority />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            {otpMode ? "Verify Your Email" : "Create Your Account"}
          </h1>
          <p className="text-gray-500 text-sm">
            {otpMode
              ? "Enter the OTP we sent to your email address."
              : "Join the PowerUp family today"}
          </p>
        </div>

        {/* Alerts */}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {successMsg && <p className="text-green-600 text-sm mb-4 text-center">{successMsg}</p>}

        {/* Registration Form */}
        {!otpMode ? (
          <form className="space-y-4" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>
        ) : (
          // OTP Verification Form
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              maxLength={6}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => setOtpMode(false)}
              className="block w-full text-sm text-gray-500 mt-2 hover:underline"
            >
              ⬅ Back to Registration
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-orange-500 hover:underline">
            Login
          </a>
        </div>
      </div>
    </main>
  );
}
