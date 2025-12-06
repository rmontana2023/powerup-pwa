// app/api/settings/change-password/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();
    console.log("Received change password request", { currentPassword, newPassword });
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await Customer.findById(payload.id);
    console.log("Changing password for user:", user);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("Current password match:", isMatch);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    // Hash new password
    user.password = newPassword;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
