import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

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

    const tokenUpdate = await Customer.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken: hashedToken,
          resetTokenExpires: expires,
        },
      },
    );

    if (tokenUpdate.matchedCount !== 1 || tokenUpdate.modifiedCount !== 1) {
      throw new Error("Failed to save password reset token");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isLocalRequest = ["localhost", "127.0.0.1"].includes(req.nextUrl.hostname);
    const appUrl = isLocalRequest ? req.nextUrl.origin : process.env.PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("PUBLIC_APP_URL is not configured");
    }

    const resetUrl = new URL("/reset-password", appUrl);
    resetUrl.searchParams.set("token", rawToken);
    resetUrl.searchParams.set("email", user.email);
    const resetLink = resetUrl.toString();

    await transporter.sendMail({
      from: `"PowerUp Rewards" <${process.env.EMAIL_USER}>`,
      to: user.email,
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
