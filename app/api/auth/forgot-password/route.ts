import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db"; // your MongoDB connection
import { Customer } from "@/models/Customer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    await connectDB();

    const user = await Customer.findOne({ email });
    if (!user)
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    // Save token to DB
    await Customer.updateOne(
      { email },
      { $set: { resetToken: token, resetTokenExpires: expires } }
    );

    // Send reset email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.PUBLIC_APP_URL}/reset-password?token=${token}&email=${email}`;

    await transporter.sendMail({
      from: `"PowerUp Rewards" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#f97316;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    return NextResponse.json({ message: "Password reset email sent successfully" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
