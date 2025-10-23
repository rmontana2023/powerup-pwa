// app/api/admin/stats/trends/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Transaction } from "@/models/Transaction";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Monthly customers added
    const customerAgg = await Customer.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Monthly transactions
    const transactionAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          points: { $sum: "$pointsEarned" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format response
    const data = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const cust =
        customerAgg.find((c) => c._id.year === year && c._id.month === month)?.count || 0;
      const trans =
        transactionAgg.find((t) => t._id.year === year && t._id.month === month)?.count || 0;
      const points =
        transactionAgg.find((t) => t._id.year === year && t._id.month === month)?.points || 0;

      data.push({
        month: date.toLocaleString("default", { month: "short" }),
        customers: cust,
        transactions: trans,
        points,
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch trend data" }, { status: 500 });
  }
}
