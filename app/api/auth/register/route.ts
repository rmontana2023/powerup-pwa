import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, password, accountType } = await req.json();
    await connectDB();

    // ✅ Basic validation
    if (!name || !email || !password || !accountType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Validate accountType
    if (!["ordinary", "fleet"].includes(accountType)) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
    }

    // ✅ Check if customer already exists
    const exists = await Customer.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // ✅ Generate OTP (10 minutes expiry)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Generate unique QR code
    const qrCode = `PU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // ✅ Create new customer (password hashed via pre-save middleware)
    const newCustomer = await Customer.create({
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

    // 🚀 Send OTP via email
    try {
      await sendEmailOtp(email, otp);
    } catch (err) {
      console.error("❌ Failed to send OTP email:", err);
    }

    // ✅ Exclude password when sending response
    const { password: _, ...userWithoutPassword } = newCustomer.toObject();

    const token = jwt.sign(
      { id: newCustomer._id, role: "customer", accountType },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export async function sendEmailOtp(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or smtp config
    auth: {
      user: process.env.EMAIL_USER, // Gmail/SMTP user
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  await transporter.sendMail({
    from: `"PowerUp Rewards" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your PowerUp OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    html: `<p>Your OTP code is <b>${otp}</b>. It will expire in <b>10 minutes</b>.</p>`,
  });
}
