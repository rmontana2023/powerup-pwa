import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { otp } = await req.json();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await Customer.findById(payload.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      user.emailChangeOtp !== otp ||
      !user.emailChangeOtpExpires ||
      user.emailChangeOtpExpires < new Date()
    ) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const oldEmail = user.email;

    user.email = user.pendingEmail;

    user.pendingEmail = undefined;
    user.emailChangeOtp = undefined;
    user.emailChangeOtpExpires = undefined;

    await user.save();

    console.log(`Email changed from ${oldEmail} to ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
