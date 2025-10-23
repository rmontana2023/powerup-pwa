// app/api/admin/customers/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { logAction } from "@/lib/log";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Customer.countDocuments(query);

    const customers = await Customer.find(query)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password -otp -resetToken -resetTokenExpires");

    return NextResponse.json({
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    // Get admin info from token
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      role: string;
      id?: string;
      name?: string;
    };

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id, accountType } = await req.json();

    if (!id || !accountType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Get current customer data
    const customer = await Customer.findById(id).select("-password");
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const beforeData = { ...customer.toObject() };

    // Update account type
    customer.accountType = accountType;
    const updated = await customer.save();

    // Log the action
    await logAction({
      userId: decoded.id,
      username: decoded.name,
      action: "Update Customer Account Type",
      before: beforeData,
      after: { ...updated.toObject() },
      ip: "", // optionally pass IP from headers if available
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
