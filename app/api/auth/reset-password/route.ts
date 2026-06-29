import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    // Hash incoming token to match DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Customer.findOne({
      email,
      resetToken: hashedToken,
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid token or email" }, { status: 400 });
    }

    // Check expiration
    if (!user.resetTokenExpires || new Date() > new Date(user.resetTokenExpires)) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and remove reset token
    await Customer.updateOne(
      { _id: user._id },
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

    return NextResponse.json({
      message: "Password reset successful. You can now login.",
    });
  } catch (err) {
    console.error("Reset password error:", err);

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
