import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await Customer.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await Customer.updateOne(
      { email },
      {
        $set: {
          resetToken: hashedToken,
          resetTokenExpires: expires,
        },
      },
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.PUBLIC_APP_URL}/reset-password?token=${rawToken}&email=${email}`;

    await transporter.sendMail({
      from: `"PowerUp Rewards" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.firstName},</p>
        <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#f97316;color:white;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    return NextResponse.json({
      message: "Password reset email sent successfully",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
