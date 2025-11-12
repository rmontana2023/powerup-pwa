import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// In-memory OTP store (use Redis/DB in production)
const otpStore = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: "Missing email" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp);

    // Send OTP via Gmail or SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // app password (not your login password)
      },
    });

    await transporter.sendMail({
      from: `"PowerUp Rewards" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your PowerUp Rewards OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>PowerUp Rewards</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="color:#e66a00;">${otp}</h1>
          <p>This code is valid for 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ success: false, error: "Failed to send OTP" });
  }
}

// Temporary export for verify route access
export { otpStore };
