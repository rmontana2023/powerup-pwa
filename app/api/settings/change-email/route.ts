// app/api/settings/change-email/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { newEmail } = await req.json();

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await Customer.findById(payload.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Optional: check if email already exists
    const existing = await Customer.findOne({ email: newEmail });
    if (existing && existing._id.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    user.email = newEmail;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
