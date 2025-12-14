// app/api/vouchers/create/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";
import { Customer } from "@/models/Customer";
import { Redemption } from "@/models/Redemption";

export async function POST(req: Request) {
  await connectDB();

  try {
    const { customerId, amount, points, stationId } = await req.json();

    // 1️⃣ Validate input
    if (!customerId || !amount || !points || points <= 0 || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    // 2️⃣ Atomically LOCK points
    const customer = await Customer.findOneAndUpdate(
      {
        _id: customerId,
        totalPoints: { $gte: points },
      },
      {
        $inc: { totalPoints: -points },
      },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json({ success: false, error: "Not enough points" }, { status: 400 });
    }

    // 4️⃣ Create Voucher
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const voucher = await Voucher.create({
      customerId,
      amount,
      points,
      pointsLocked: points,
      redeemed: false,
      expiresAt,
      createdAt: new Date(),
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });

    // 5️⃣ Record Redemption
    await Redemption.create({
      customerId,
      points,
      amount,
      type: "locked",
      description: `Locked points for voucher worth ₱${amount}`,
      stationId: stationId || "Manual Redemption",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, voucher, totalPoints: customer.totalPoints });
  } catch (err) {
    console.error("Voucher creation error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
