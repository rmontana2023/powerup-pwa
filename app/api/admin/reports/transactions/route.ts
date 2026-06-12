import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "@/models/Transaction";
import { connectDB } from "@/lib/db";
import "@/models";

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const customerId = searchParams.get("customerId");
  const stationId = searchParams.get("stationId");
  const source = searchParams.get("source");
  const receiptNo = searchParams.get("receiptNo");

  const query: any = {};

  if (from || to) {
    query.taggedAt = {};

    if (from) {
      query.taggedAt.$gte = new Date(from);
    }

    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      query.taggedAt.$lte = end;
    }
  }

  if (customerId) query.customerId = customerId;
  if (stationId) query.stationId = stationId;
  if (source) query.source = source;

  if (receiptNo) {
    query.receiptNo = {
      $regex: receiptNo,
      $options: "i",
    };
  }

  const transactions = await Transaction.find(query)
    .populate("customerId", "firstName lastName email")
    .populate("stationId", "name")
    .populate("taggedBy", "name")
    .sort({ taggedAt: -1 });
  console.log("Transactions found:", transactions.length);

  return NextResponse.json(transactions);
}
