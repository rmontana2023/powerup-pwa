import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { getVerifiedCustomer } from "@/lib/server-auth";

export async function GET() {
  try {
    const auth = await getVerifiedCustomer();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    // fetch customer
    const customer = await Customer.findById(auth.id).select(
      "-password -otp -otpExpires -resetToken -resetTokenExpires -redemptionVersion",
    );

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
