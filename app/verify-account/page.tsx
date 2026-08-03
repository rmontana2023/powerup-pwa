"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function VerifyAccountPage() {
const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const [loading, setLoading] = useState(false);
const [checkingUser, setCheckingUser] = useState(true);

const [userId, setUserId] = useState("");
const [email, setEmail] = useState("");
const router = useRouter();

const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

useEffect(() => {
  const loadUser = async () => {
    try {
      const res = await fetch("/api/auth/me");

      if (!res.ok) {
        router.replace("/login");
        return;
      }

      const data = await res.json();

      if (data.user.isVerified) {
        router.replace("/dashboard");
        return;
      }

      setUserId(data.user._id);
      setEmail(data.user.email);
    } finally {
      setCheckingUser(false);
    }
  };

  loadUser();
}, [router]);


const handleOtpChange = (value: string, index: number) => {
  if (!/^\d*$/.test(value)) return;

  // Paste support
  if (value.length > 1) {
    const values = value.slice(0, 6).split("");

    const newOtp = [...otp];

    values.forEach((digit, i) => {
      if (index + i < 6) {
        newOtp[index + i] = digit;
      }
    });

    setOtp(newOtp);

    const nextIndex = Math.min(index + values.length, 5);
    inputRefs.current[nextIndex]?.focus();

    return;
  }

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  if (value && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }
};

const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  index: number
) => {
  if (e.key === "Backspace") {
    if (otp[index]) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }
};

const otpCode = otp.join("");

const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  try {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
        userId,
        otp: otpCode,
    })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    Swal.fire({
      icon: "success",
      title: "Account Verified",
      text: "Redirecting...",
    }).then(() => {
        router.replace("/dashboard");
    });

  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "OTP Error",
      text: err.message,
    });
  } finally {
    setLoading(false);
  }
};

const handleResendOtp = async () => {
  try {
    const res = await fetch("/api/otp/resend-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.cooldown) {
        Swal.fire({
          icon: "warning",
          title: "Please wait",
          text: `You can request another OTP in ${Math.ceil(
            data.cooldown / 60
          )} minute(s).`,
        });

        return;
      }

      throw new Error(data.error);
    }

    Swal.fire({
      icon: "success",
      title: "OTP Sent",
      text: "A new OTP has been sent to your email.",
    });
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "Resend Failed",
      text: err.message,
    });
  }
};
const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();

  const pasted = e.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (!pasted) return;

  const newOtp = ["", "", "", "", "", ""];

  pasted.split("").forEach((digit, index) => {
    newOtp[index] = digit;
  });

  setOtp(newOtp);

  inputRefs.current[Math.min(pasted.length - 1, 5)]?.focus();
};

if (checkingUser) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-orange-500 text-lg font-semibold animate-pulse">
        Loading...
      </div>
    </div>
  );
}

 return (
  <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
    <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl">

      <h1 className="text-2xl font-bold text-center text-white">
        Verify your account
      </h1>

      <p className="text-gray-400 text-center mt-2 text-sm">
        We sent a verification code to
      </p>

      <p className="text-orange-500 text-center font-semibold break-all">
        {email}
      </p>

      <form
        onSubmit={handleVerifyOtp}
        className="space-y-6 mt-8"
      >
        <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
             <input
                key={index}
                ref={(el) => {
                    inputRefs.current[index] = el;
                }}
                autoFocus={index === 0}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={digit}
                onPaste={handlePaste}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="
                    w-11 h-12
                    sm:w-14 sm:h-16
                    rounded-xl
                    border border-neutral-700
                    bg-neutral-800
                    text-white
                    text-center
                    text-xl sm:text-2xl
                    font-bold
                    outline-none
                    transition-all
                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-500
                "
                />
            ))}
            </div>

       

        <button
          type="submit"
          disabled={loading || otpCode.length !== 6}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Account"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResendOtp}
        disabled={loading}
        className="w-full mt-4 text-orange-500 hover:underline font-medium disabled:opacity-50"
      >
        Resend OTP
      </button>

    </div>
  </div>
);
}