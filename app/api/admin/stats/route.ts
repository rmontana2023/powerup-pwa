// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Transaction } from "@/models/Transaction";

export async function GET() {
  try {
    console.log("------ Getting Stats ------------------");
    await connectDB();

    // Total customers
    const customers = await Customer.countDocuments();
    console.log("🚀 ~ GET ~ customers:", customers);

    // Total transactions
    const transactions = await Transaction.countDocuments();
    console.log("🚀 ~ GET ~ transactions:", transactions);

    // Total points (sum of all customers’ totalPoints)
    const pointsAgg = await Customer.aggregate([
      { $group: { _id: null, totalPoints: { $sum: "$totalPoints" } } },
    ]);
    const points = pointsAgg[0]?.totalPoints || 0;

    return NextResponse.json({ customers, transactions, points });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
