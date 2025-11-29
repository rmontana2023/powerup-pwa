import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== "customer")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { province, city, barangay, street, zipCode } = body;

    const customer = await Customer.findById(decoded.id);
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    customer.province = province;
    customer.city = city;
    customer.barangay = barangay;
    customer.street = street;
    customer.zipCode = zipCode;

    await customer.save();

    return NextResponse.json({ message: "Additional info saved", customer });
  } catch (err: any) {
    console.error("Additional info error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
