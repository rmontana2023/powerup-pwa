"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-new-logo.png";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const isPasswordValid = passwordRegex.test(password);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      return setMsg("Password must be at least 8 characters and contain letters and numbers.");
    }
    if (password !== confirm) return setMsg("Passwords do not match");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });

    const data = await res.json();
    setMsg(data.error || data.message);

    if (res.ok) {
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)] to-white px-4">
      {/* Logo */}
      <div className="mb-8">
        <Image src={logo2} alt="PowerUp Rewards" width={250} height={80} priority />
      </div>

      {/* Reset Password Form */}
      <form
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
        onSubmit={handleReset}
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Password</h1>
        <p className="text-center text-gray-600 text-sm mb-4">Enter your new password below</p>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg
               text-black placeholder-gray
               focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          {password && !isPasswordValid && (
            <p className="text-xs text-red-500">
              Password must be at least 8 characters and contain letters and numbers
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg
               text-black placeholder-gray
               focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {msg && <p className="text-sm text-green-500 text-center">{msg}</p>}

        <button
          type="submit"
          disabled={!isPasswordValid || password !== confirm}
          className={`w-full font-semibold p-3 rounded-lg transition
    ${
      !isPasswordValid || password !== confirm
        ? "bg-orange-300 cursor-not-allowed"
        : "bg-orange-500 hover:bg-orange-600 text-white"
    }`}
        >
          Reset Password
        </button>

        <p className="text-center text-gray-500 text-sm mt-2">
          Remembered your password?{" "}
          <span
            className="text-orange-500 hover:underline cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </main>
  );
}
