// File: /app/api/transactions/me/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Redemption } from "@/models/Redemption";
import Voucher from "@/models/Voucher";
// 1️⃣ Define types for lean() results
interface TxDoc {
  _id: any;
  taggedAt: string;
  pointsEarned: number;
  liters: number;
  amount: number;
  stationId?: { name: string };
}

interface RdDoc {
  _id: any;
  createdAt: string;
  points: number;
  description?: string;
  stationId?: string;
}
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    await connectDB();

    // 2️⃣ Fetch transactions + redemptions with explicit typing
    const transactions = await Transaction.find({ customerId })
      .sort({ taggedAt: -1 })
      .lean<TxDoc[]>();

    const redemptions = await Redemption.find({ customerId })
      .sort({ createdAt: -1 })
      .lean<RdDoc[]>();

    // 3️⃣ Map them safely
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
      points: -r.points,
      description: r.description || "Points redeemed",
      station: r.stationId || "Station",
    }));

    // 4️⃣ Merge + sort
    const combined = [...txMapped, ...rdMapped].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ transactions: combined });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
