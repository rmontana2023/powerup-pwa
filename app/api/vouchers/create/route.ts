// app/api/vouchers/create/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";

export async function POST(req: Request) {
  await connectDB();

  try {
    const { customerId, amount, points } = await req.json();

    if (!customerId || !amount || !points) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // ✅ Check if user already has an active voucher
    const existing = await Voucher.findOne({
      customerId,
      redeemed: false,
      expiresAt: { $gte: new Date() },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: "You already have an active voucher. Please use it before generating a new one.",
      });
    }

    // ✅ Create new voucher
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // valid for 7 days

    const voucher = await Voucher.create({
      customerId,
      amount,
      points,
      redeemed: false,
      expiresAt,
      createdAt: new Date(),
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });

    return NextResponse.json({ success: true, voucher });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
