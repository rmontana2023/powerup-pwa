"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
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

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        {msg && <p className="text-sm text-red-500 text-center">{msg}</p>}

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition"
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
