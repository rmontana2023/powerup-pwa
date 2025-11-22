import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Voucher from "@/models/Voucher";

export async function GET(req: Request) {
  await connectDB();
  const url = new URL(req.url);
  const customerId = url.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ vouchers: [] });

  const vouchers = await Voucher.find({ customerId });
  return NextResponse.json({ vouchers });
}
