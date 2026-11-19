import { NextResponse } from "next/server";
import { getVerifiedCustomer } from "@/lib/server-auth";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { availableRewards } from "@/lib/customer-rewards";
export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await getVerifiedCustomer();
  if (!auth) return NextResponse.json({ error: "Sign in to view rewards." }, { status: 401 });
  try {
    await connectDB();
    const customer = await Customer.findById(auth.id);
    if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    const rewards = await availableRewards(customer.accountType);
    return NextResponse.json({ rewards: rewards.map(reward => ({ _id: String(reward._id), title: reward.title, kind: reward.kind, points: reward.points, peso: reward.amount, source: reward.source })) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Rewards are temporarily unavailable." }, { status: 503 });
  }
}
