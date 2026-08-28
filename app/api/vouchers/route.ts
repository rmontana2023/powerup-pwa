import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Voucher from "@/models/Voucher";
import { getVerifiedCustomer } from "@/lib/server-auth";

export async function GET() {
  const auth = await getVerifiedCustomer();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const vouchers = await Voucher.find({ customerId: auth.id });
  return NextResponse.json({ vouchers });
}
