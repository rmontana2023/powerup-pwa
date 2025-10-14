// /api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

export async function POST(req: Request) {
  await connectDB();
  const { userId, otp } = await req.json();

  const user = await Customer.findById(userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.isVerified) return NextResponse.json({ error: "Already verified" }, { status: 400 });

  if (user.otp !== otp || new Date() > user.otpExpires) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id, role: "customer" }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  const { password, ...safeUser } = user.toObject();
  return NextResponse.json({ token, user: safeUser });
}
