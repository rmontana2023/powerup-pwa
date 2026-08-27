import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    // Hash incoming token to match DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Customer.findOne({
      email,
      resetToken: hashedToken,
    }).select("resetTokenExpires");

    if (!user) {
      return NextResponse.json({ error: "Invalid token or email" }, { status: 400 });
    }

    // Check expiration
    const expiresAt = user.resetTokenExpires?.getTime();
    if (!expiresAt || expiresAt <= Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and remove reset token
    const result = await Customer.updateOne(
      {
        _id: user._id,
        resetToken: hashedToken,
        resetTokenExpires: { $gt: new Date() },
      },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetToken: "",
          resetTokenExpires: "",
        },
      },
    );

    if (result.modifiedCount !== 1) {
      return NextResponse.json(
        { error: "Reset link is invalid, expired, or has already been used" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Password reset successful. You can now login.",
    });
  } catch (err) {
    console.error("Reset password error:", err);

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
