// app/api/settings/change-mobile/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await Customer.findById(payload.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.phone = mobile;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
