// app/api/vouchers/user/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";
import type { NextRequest } from "next/server";
import { getVerifiedCustomer } from "@/lib/server-auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await getVerifiedCustomer();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (id !== auth.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
