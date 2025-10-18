"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

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
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotMsg(data.error || "Failed to send reset email.");
        return;
      }

      setForgotMsg("Check your email for password reset instructions.");
    } catch (err) {
      console.error(err);
      setForgotMsg("Something went wrong. Please try again.");
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
          <div className="flex justify-end text-sm mt-1">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-orange-500 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
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
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
            <button
              onClick={() => {
                setShowForgot(false);
                setForgotMsg("");
                setForgotEmail("");
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖️
            </button>
            <h2 className="text-lg font-semibold mb-4">Forgot Password</h2>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg"
              >
                Send Reset Link
              </button>
            </form>
            {forgotMsg && <p className="text-sm mt-2 text-center text-gray-700">{forgotMsg}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
