import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Otp } from "@/models/Otp";
import { sendEmailOtp } from "@/lib/sendEmailOtp";

const OTP_COOLDOWN_SECONDS = 180;
const OTP_EXPIRY_MINUTES = 10;

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "Account already verified" }, { status: 400 });
    }

    // ⏳ Cooldown check (REGISTER only)
    const lastOtp = await Otp.findOne({
      email: user.email,
      purpose: "REGISTER",
    }).sort({ createdAt: -1 });

    if (lastOtp) {
      const elapsed = (Date.now() - new Date(lastOtp.createdAt).getTime()) / 1000;

      if (elapsed < OTP_COOLDOWN_SECONDS) {
        return NextResponse.json(
          {
            cooldown: Math.ceil(OTP_COOLDOWN_SECONDS - elapsed),
            error: "Please wait before requesting another OTP",
          },
          { status: 429 }
        );
      }
    }

    // ❌ Invalidate old REGISTER OTPs
    await Otp.updateMany({ email: user.email, purpose: "REGISTER", used: false }, { used: true });

    // 🔢 Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email: user.email,
      code: otp,
      purpose: "REGISTER",
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    // 📧 Send OTP
    await sendEmailOtp(user.email, otp);

    return NextResponse.json({
      success: true,
      message: "New OTP sent",
    });
  } catch (err) {
    console.error("❌ Resend OTP Error:", err);
    return NextResponse.json({ error: "Failed to resend OTP" }, { status: 500 });
  }
}
