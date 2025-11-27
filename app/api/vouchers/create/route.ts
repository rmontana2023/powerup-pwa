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

    if (!customerId || !amount || !points) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    // 2️⃣ Check if customer has enough points
    if (customer.totalPoints < points) {
      return NextResponse.json({ success: false, error: "Not enough points" }, { status: 400 });
    }

    // 3️⃣ Deduct points
    // customer.totalPoints -= points;
    // await customer.save();

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
