import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Redemption } from "@/models/Redemption";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    await connectDB();

    const redemptions = await Redemption.find({ customerId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("Error fetching redemptions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
