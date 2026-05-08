import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmailOtp } from "@/lib/sendEmailOtp";

export async function POST(req: Request) {
  try {
    const { newEmail, password } = await req.json();

    if (!newEmail || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

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

    // VERIFY PASSWORD
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    // CHECK EXISTING EMAIL
    const existing = await Customer.findOne({
      email: normalizedEmail,
    });

    if (existing && existing._id.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // GENERATE OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.pendingEmail = normalizedEmail;
    user.emailChangeOtp = otp;
    user.emailChangeOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // SEND OTP TO NEW EMAIL
    await sendEmailOtp(normalizedEmail, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent",
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
