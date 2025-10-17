import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { userId, otp } = await req.json();
    await connectDB();

    const user = await Customer.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "Account already verified" }, { status: 400 });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // ✅ Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 🪪 Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: "customer", accountType: user.accountType },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const { ...userData } = user.toObject();
    return NextResponse.json({
      message: "OTP verified successfully",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("❌ OTP verification error:", err);
    return NextResponse.json({ error: "OTP verification failed" }, { status: 500 });
  }
}
