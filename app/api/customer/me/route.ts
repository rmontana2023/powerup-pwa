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

export async function PATCH(req: Request) {
  try {
    const auth = await getVerifiedCustomer();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const fields = ["firstName", "middleName", "lastName", "phone", "birthDate"] as const;
    const updates: Record<string, string | Date> = {};
    for (const field of fields) {
      if (typeof body[field] !== "string") {
        return NextResponse.json({ error: "Please complete your personal details" }, { status: 400 });
      }
      updates[field] = body[field].trim();
    }
    for (const field of ["firstName", "middleName", "lastName"]) {
      const value = updates[field] as string;
      if ((field !== "middleName" && !value) || value.length > 100) {
        return NextResponse.json({ error: "Names must contain 1–100 characters (middle name is optional)" }, { status: 400 });
      }
    }
    if (!/^09\d{9}$/.test(updates.phone as string)) {
      return NextResponse.json({ error: "Enter a valid Philippine mobile number (09XXXXXXXXX)" }, { status: 400 });
    }
    const birthDate = updates.birthDate as string;
    const date = new Date(`${birthDate}T00:00:00.000Z`);
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== birthDate || birthDate > today) {
      return NextResponse.json({ error: "Enter a valid birthdate that is not in the future" }, { status: 400 });
    }
    updates.birthDate = date;
    await connectDB();
    const customer = await Customer.findByIdAndUpdate(auth.id, { $set: updates }, {
      new: true, runValidators: true,
    }).select("_id firstName middleName lastName phone email birthDate qrCode");
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json({ customer });
  } catch (err) {
    console.error("Personal details update failed:", err);
    return NextResponse.json({ error: "Unable to save personal details. Please try again." }, { status: 500 });
  }
}
