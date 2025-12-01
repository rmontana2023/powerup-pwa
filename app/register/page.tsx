"use client";
import { useState } from "react";
import Image from "next/image";
import logo2 from "../../public/assets/logo/powerup-logo-2.png";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    // middleName: "",
    lastName: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    accountType: "ordinary",
    agreeTerms: false,
  });

  const [error, setError] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // ---------------------------
    // VALIDATIONS
    // ---------------------------

    if (
      !form.firstName ||
      // !form.middleName ||
      !form.lastName ||
      !form.birthDate ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      return Swal.fire({
        icon: "warning",
        title: "All fields are required",
        text: "Please fill out all required fields",
        confirmButtonColor: "#f97316",
      });
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: "#f97316",
      });
    }

    if (form.password.length < 6) {
      return Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 6 characters",
        confirmButtonColor: "#f97316",
      });
    }

    if (form.password !== form.confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "Password Mismatch",
        text: "Passwords do not match",
        confirmButtonColor: "#f97316",
      });
    }

    if (!form.agreeTerms) {
      return Swal.fire({
        icon: "warning",
        title: "Terms & Privacy",
        html: "You must agree to the <a href='/terms' class='text-orange-500 underline'>Terms & Conditions</a> and <a href='/privacy' class='text-orange-500 underline'>Data Privacy</a>",
        confirmButtonColor: "#f97316",
      });
    }

    // Birthdate validation
    const birthDateObj = new Date(form.birthDate);
    const today = new Date();
    if (birthDateObj > today) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Birthdate",
        text: "Birthdate cannot be in the future",
        confirmButtonColor: "#f97316",
      });
    }
    const minAge = 13;
    const ageDiff = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    const dayDiff = today.getDate() - birthDateObj.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? ageDiff - 1 : ageDiff;
    if (actualAge < minAge) {
      return Swal.fire({
        icon: "warning",
        title: "Too Young",
        text: `You must be at least ${minAge} years old to register`,
        confirmButtonColor: "#f97316",
      });
    }

    // ---------------------------
    // SUBMIT FORM
    // ---------------------------
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Switch to OTP mode
      setUserId(data.userId);
      setOtpMode(true);
      setSuccessMsg("We’ve sent a 6-digit OTP to your email. Please check your inbox.");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: err.message || "Error encountered",
        confirmButtonColor: "#f97316",
      });
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
      window.location.href = "/login";
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "OTP Error",
        text: "Error verifying OTP",
        confirmButtonColor: "#f97316",
      });
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
          <p className="text-gray-500 text-sm text-center">
            {otpMode
              ? "Enter the OTP we sent to your email address."
              : "Join the PowerUp family today"}
          </p>
        </div>

        {/* Alerts */}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {successMsg && <p className="text-green-600 text-sm mb-4 text-center">{successMsg}</p>}

        {/* Registration / OTP Form */}
        {!otpMode ? (
          <form className="space-y-4" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="text"
              placeholder="Middle Name"
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
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
              placeholder="Mobile Number"
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

            <div className="mt-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                  required
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  Yes, I understand and agree to the{" "}
                  <button
                    type="button"
                    className="text-orange-500 underline"
                    onClick={() => setShowTerms(true)}
                  >
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-orange-500 underline"
                    onClick={() => setShowPrivacy(true)}
                  >
                    Data Privacy
                  </button>
                  .
                </span>
              </label>

              {/* Terms Modal */}
              {showTerms && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white w-full max-w-lg h-[80vh] rounded-lg p-4 relative">
                    <button
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                      onClick={() => setShowTerms(false)}
                    >
                      ✕
                    </button>
                    <iframe src="/docs/terms-condition.pdf" className="w-full h-full"></iframe>
                  </div>
                </div>
              )}

              {/* Privacy Modal */}
              {showPrivacy && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white w-full max-w-lg h-[80vh] rounded-lg p-8 relative">
                    <button
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                      onClick={() => setShowPrivacy(false)}
                    >
                      ✕
                    </button>
                    <iframe src="/docs/data-privacy.pdf" className="w-full h-full"></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* Terms Modal */}
            <div
              id="termsModal"
              className="fixed inset-0 bg-black/50 flex items-center justify-center hidden z-50"
            >
              <div className="bg-white w-full max-w-lg h-[80vh] rounded-lg p-4 relative">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    const modal = document.getElementById("termsModal");
                    if (modal) modal.style.display = "none";
                  }}
                >
                  ✕
                </button>
                <iframe src="/docs/terms-condition.pdf" className="w-full h-full"></iframe>
              </div>
            </div>

            {/* Privacy Modal */}
            <div
              id="privacyModal"
              className="fixed inset-0 bg-black/50 flex items-center justify-center hidden z-50"
            >
              <div className="bg-white w-full max-w-lg h-[80vh] rounded-lg p-4 relative">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    const modal = document.getElementById("privacyModal");
                    if (modal) modal.style.display = "none";
                  }}
                >
                  ✕
                </button>
                <iframe src="/docs/data-privacy.pdf" className="w-full h-full"></iframe>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-orange-500 font-semibold hover:underline">
                  Login
                </a>
              </p>
            </div>
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
      </div>
    </main>
  );
}
