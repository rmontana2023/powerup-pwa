// app/api/vouchers/user/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, context: any) {
  const id = context.params.id; // <- THIS is valid

  console.log("🚀 Fetching vouchers for:", id);

  await connectDB();

  try {
    const vouchers = await Voucher.find({ customerId: id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, vouchers });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}
