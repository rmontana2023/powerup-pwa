import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Otp } from "@/models/Otp";

const OTP_EXPIRY_MINUTES = 5;
const OTP_COOLDOWN_SECONDS = 60;

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" });
    }

    const user = await Customer.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "Email not found" });
    }

    // ⏳ Cooldown check (voucher-only)
    const lastOtp = await Otp.findOne({
      email,
      purpose: "VOUCHER",
    }).sort({ createdAt: -1 });

    if (lastOtp) {
      const elapsed = (Date.now() - new Date(lastOtp.createdAt).getTime()) / 1000;

      if (elapsed < OTP_COOLDOWN_SECONDS) {
        return NextResponse.json({
          success: false,
          cooldown: Math.ceil(OTP_COOLDOWN_SECONDS - elapsed),
          error: "Please wait before requesting another OTP",
        });
      }
    }

    // ❌ Invalidate previous unused voucher OTPs
    await Otp.updateMany(
      {
        email,
        purpose: "VOUCHER",
        used: false,
      },
      { used: true }
    );

    // 🔐 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email,
      code: otp,
      purpose: "VOUCHER",
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    // 📧 Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PowerUp Rewards" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your PowerUp Voucher OTP",
      html: `
        <div style="font-family: Arial; text-align:center;">
          <h2>PowerUp Rewards</h2>
          <p>Your voucher OTP is:</p>
          <h1 style="color:#e66a00;">${otp}</h1>
          <p>This code is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Voucher OTP sent",
    });
  } catch (error) {
    console.error("Send Voucher OTP Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to send OTP",
    });
  }
}
