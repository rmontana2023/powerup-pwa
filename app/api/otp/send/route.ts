import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

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

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // valid for 5 minutes
    await user.save();

    // Email Transporter
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
      subject: "Your PowerUp Rewards OTP Code",
      html: `
        <div style="font-family: Arial; text-align:center; padding: 20px;">
          <h2>PowerUp Rewards</h2>
          <p>Your OTP code is:</p>
          <h1 style="color:#e66a00;">${otp}</h1>
          <p>Valid for 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send OTP" });
  }
}
