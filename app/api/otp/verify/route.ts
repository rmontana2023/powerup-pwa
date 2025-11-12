import { NextResponse } from "next/server";
import { otpStore } from "../send/route";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    const storedOTP = otpStore.get(email);

    if (!storedOTP) {
      return NextResponse.json({ success: false, error: "No OTP found or expired" });
    }

    if (storedOTP !== otp) {
      return NextResponse.json({ success: false, error: "Invalid OTP" });
    }

    // OTP matched — remove it
    otpStore.delete(email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ success: false, error: "Error verifying OTP" });
  }
}
