import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Otp } from "@/models/Otp";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, otp } = await req.json();

    if (!userId || !otp) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "Account already verified" }, { status: 400 });
    }

    // 🔐 Validate OTP (REGISTER ONLY)
    const otpRecord = await Otp.findOne({
      email: user.email,
      code: String(otp).trim(),
      purpose: "REGISTER",
      used: false,
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (otpRecord.expiresAt < new Date()) {
      otpRecord.used = true;
      await otpRecord.save();
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // ✅ Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // ✅ Verify user
    user.isVerified = true;
    await user.save();

    // 🪪 Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: "customer",
        accountType: user.accountType,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const userData = user.toObject();
    delete userData.password;

    return NextResponse.json({
      success: true,
      message: "Account verified successfully",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("❌ Verify Register OTP Error:", err);
    return NextResponse.json({ error: "OTP verification failed" }, { status: 500 });
  }
}
