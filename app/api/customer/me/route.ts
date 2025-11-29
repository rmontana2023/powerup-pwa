import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Get token from cookies
    const token = req.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // fetch customer
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
