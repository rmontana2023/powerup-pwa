import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Station } from "@/models/Station"; // ✅ ADD THIS LINE

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    console.log("🚀 ~ GET ~ customerId:", customerId);

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    await connectDB();

    const transactions = await Transaction.find({ customerId })
      // .populate("stationId", "name")
      .sort({ taggedAt: -1 })
      .lean();

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
