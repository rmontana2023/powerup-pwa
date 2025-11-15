import { NextResponse } from "next/server";
import { Customer } from "@/models/Customer";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required" });
    }

    const user = await Customer.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, error: "Email not found" });
    }

    // If no OTP stored
    if (!user.otp || !user.otpExpires) {
      return NextResponse.json({ success: false, error: "OTP not found or expired" });
    }

    // Expired?
    if (user.otpExpires < new Date()) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      return NextResponse.json({ success: false, error: "OTP expired" });
    }

    // Incorrect OTP
    if (user.otp !== otp) {
      return NextResponse.json({ success: false, error: "Invalid OTP" });
    }

    // OTP matched — clear OTP + mark verified
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    return NextResponse.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify OTP" });
  }
}
