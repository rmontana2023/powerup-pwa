import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";

export async function POST(req: Request) {
  const body = await req.json();
  const { customerId, amount, points } = body;

  if (!customerId || !amount) {
    return NextResponse.json({ error: "Missing customerId or amount" });
  }

  try {
    await connectDB();

    const code = "VCHR" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const voucher = await Voucher.create({
      code,
      amount,
      points,
      customerId,
      redeemed: false,
      expiresAt,
    });

    console.log("Voucher created:", voucher);
    return NextResponse.json({ success: true, voucher });
  } catch (err) {
    console.error("Voucher creation error:", err);
    return NextResponse.json({ success: false, error: "Failed to create voucher" });
  }
}
