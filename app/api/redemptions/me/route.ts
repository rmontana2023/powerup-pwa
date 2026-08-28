import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Redemption } from "@/models/Redemption";
import { getVerifiedCustomer } from "@/lib/server-auth";

export async function GET() {
  try {
    const auth = await getVerifiedCustomer();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const redemptions = await Redemption.find({ customerId: auth.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("Error fetching redemptions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
