import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db"; // your MongoDB connection
import { Customer } from "@/models/Customer";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json();
    if (!email || !token || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await connectDB();

    const user = await Customer.findOne({ email, resetToken: token });
    console.log("🚀 ~ POST ~ user:", user);
    if (!user) return NextResponse.json({ error: "Invalid token or email" }, { status: 400 });

    if (new Date() > new Date(user.resetTokenExpires))
      return NextResponse.json({ error: "Token expired" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    await Customer.updateOne(
      { email },
      { $set: { password: hashed }, $unset: { resetToken: "", resetTokenExpires: "" } }
    );

    return NextResponse.json({ message: "Password reset successful. You can now login." });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
