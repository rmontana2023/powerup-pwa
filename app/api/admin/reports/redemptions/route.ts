import { NextRequest, NextResponse } from "next/server";
import { Redemption } from "@/models/Redemption";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const customerId = searchParams.get("customerId");
  const stationId = searchParams.get("stationId");
  const type = searchParams.get("type");

  const query: any = {};

  if (from || to) {
    query.createdAt = {};

    if (from) {
      query.createdAt.$gte = new Date(from);
    }

    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      query.createdAt.$lte = end;
    }
  }

  if (customerId) query.customerId = customerId;
  if (stationId) query.stationId = stationId;
  if (type) query.type = type;

  const redemptions = await Redemption.find(query)
    .populate("customerId", "firstName lastName email")
    .sort({ createdAt: -1 });

  return NextResponse.json(redemptions);
}
