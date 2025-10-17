import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { sendEmailOtp } from "@/lib/sendEmailOtp"; // move the sendEmailOtp function here
// import { sendSmsOtp } from "@/lib/sendSmsOtp"; // reserved for SMS OTP (future use)

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, password, accountType } = await req.json();
    await connectDB();

    if (!name || !email || !password || !accountType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // 🔢 Generate OTP (10-minute expiry)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 🎟️ Generate unique QR code for user
    const qrCode = `PU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 🧑‍💻 Create unverified user
    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      password,
      qrCode,
      accountType,
      otp,
      otpExpires,
      isVerified: false,
    });

    // 📧 Send OTP via Email
    try {
      await sendEmailOtp(email, otp);
    } catch (err) {
      console.error("❌ Email OTP failed:", err);
    }

    // 📱 Reserved for future SMS OTP sending
    // try {
    //   await sendSmsOtp(phone, otp);
    // } catch (err) {
    //   console.error("❌ SMS OTP failed:", err);
    // }

    return NextResponse.json({
      message: "OTP sent to your email",
      userId: customer._id.toString(),
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
