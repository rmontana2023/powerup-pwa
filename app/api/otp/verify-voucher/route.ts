import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Otp } from "@/models/Otp";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({
        success: false,
        error: "Email and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({
      email,
      code: String(otp).trim(),
      purpose: "VOUCHER",
      used: false,
    });

    if (!otpRecord) {
      return NextResponse.json({
        success: false,
        error: "Invalid or already used OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      otpRecord.used = true;
      await otpRecord.save();

      return NextResponse.json({
        success: false,
        error: "OTP expired",
      });
    }

    // ✅ Mark OTP as used (ONE TIME ONLY)
    otpRecord.used = true;
    await otpRecord.save();

    return NextResponse.json({
      success: true,
      message: "Voucher OTP verified",
    });
  } catch (error) {
    console.error("Verify Voucher OTP Error:", error);
    return NextResponse.json({
      success: false,
      error: "OTP verification failed",
    });
  }
}
