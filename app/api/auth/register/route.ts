import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Otp } from "@/models/Otp";
import { sendEmailOtp } from "@/lib/sendEmailOtp";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      address,
      password,
      accountType,
      birthDate,
    } = await req.json();

    if (!firstName || !lastName || !email || !password || !accountType || !birthDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid PH mobile number" }, { status: 400 });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // 🔐 Create user (UNVERIFIED)
    const qrCode = `PU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const customer = await Customer.create({
      firstName,
      middleName,
      lastName,
      birthDate,
      email,
      phone,
      address,
      password,
      qrCode,
      accountType,
      isVerified: false,
    });

    // ❌ Invalidate old REGISTER OTPs (safety)
    await Otp.updateMany({ email, purpose: "REGISTER", used: false }, { used: true });

    // 🔢 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email,
      code: otp,
      purpose: "REGISTER",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // 📧 Send OTP
    await sendEmailOtp(email, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      userId: customer._id.toString(),
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
