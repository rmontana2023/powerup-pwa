// File: /app/api/transactions/me/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Redemption } from "@/models/Redemption";
import Voucher from "@/models/Voucher";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    await connectDB();

    // 1️⃣ Fetch transactions
    const transactions = await Transaction.find({ customerId }).sort({ taggedAt: -1 }).lean();

    // 2️⃣ Fetch redemptions
    const redemptions = await Redemption.find({ customerId }).sort({ createdAt: -1 }).lean();

    // 3️⃣ Fetch locked vouchers (not redeemed yet)
    const lockedVouchers = await Voucher.find({
      customerId,
      redeemed: false,
      pointsLocked: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .lean();

    // 4️⃣ Map to unified format
    const txMapped = transactions.map((t) => ({
      _id: t._id.toString(),
      type: "Transaction" as const,
      date: t.taggedAt,
      points: t.pointsEarned,
      liters: t.liters,
      amount: t.amount,
      station: t.stationId?.name || "Station",
    }));

    const rdMapped = redemptions.map((r) => ({
      _id: r._id.toString(),
      type: "Redemption" as const,
      date: r.createdAt,
      points: -r.points, // negative because points were spent
      description: r.description || "Points redeemed",
      station: r.stationId || "Station",
    }));

    const lockedMapped = lockedVouchers.map((v) => ({
      _id: v._id.toString(),
      type: "Locked" as const,
      date: v.createdAt,
      points: -v.pointsLocked, // negative to show “reserved”
      description: `Locked for voucher ₱${v.amount}`,
      station: "Pending",
    }));

    // 5️⃣ Merge and sort by date descending
    const combined = [...txMapped, ...rdMapped, ...lockedMapped].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ transactions: combined });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
