import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongo";
import { Transaction } from "@/models/Transaction";
import { Redemption } from "@/models/Redemption";
import { Customer } from "@/models/Customer";

export async function GET(req: Request) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "daily";

  let startDate = new Date();

  if (filter === "weekly") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (filter === "monthly") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate.setHours(0, 0, 0, 0);
  }

  const transactions = await Transaction.find({
    taggedAt: { $gte: startDate },
    status: "COMPLETED",
  });

  const redemptions = await Redemption.find({
    createdAt: { $gte: startDate },
  });

  const customers = await Customer.find({
    createdAt: { $gte: startDate },
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalOrders = transactions.length;
  const totalLiters = transactions.reduce((sum, t) => sum + t.liters, 0);

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    totalLiters,
    totalCustomers: customers.length,
    recentTransactions: transactions.slice(0, 10),

    chartData: {
      transactions: transactions.map((t) => ({
        date: t.taggedAt,
        amount: t.amount,
      })),
      redemptions: redemptions.map((r) => ({
        date: r.createdAt,
        points: r.points,
        type: r.type,
      })),
      customers: customers.map((c) => ({
        date: c.createdAt,
      })),
    },
  });
}
