import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET env variable is not set");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

    await connectDB();

    const user = await Customer.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return NextResponse.json({ err: "Invalid token" }, { status: 401 });
  }
}
