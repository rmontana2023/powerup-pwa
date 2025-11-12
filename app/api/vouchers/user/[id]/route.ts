// app/api/vouchers/user/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log("🚀 ~ GET ~ params:", params.id);
  await connectDB();
  try {
    const vouchers = await Voucher.find({ customerId: params.id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, vouchers });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}
