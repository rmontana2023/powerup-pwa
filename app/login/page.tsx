"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../public/assets/logo/powerup-logo.png";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // ✅ Save user data to localStorage (adjust field names based on your API response)
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user)); // full object
        localStorage.setItem("customerId", data.user._id || data.user.id); // for easy access
        console.log("User saved locally:", data.user);
      }

      // ✅ Redirect to dashboard after login
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  // Login screen
  return (
    <main className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src={logo2} alt="PowerUp Rewards" width={250} height={80} priority />
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition-all"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/register" className="text-orange-500 hover:underline">
            Register
          </a>
        </div>
      </div>
    </main>
  );
}
