import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not set");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as {
      id: string;
      role: string;
    };

    if (decoded.role !== "customer") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const {
      province,
      provinceCode,
      city,
      cityCode,
      barangay,
      barangayCode,
      street,
      zipCode,
    } = await req.json();

    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    customer.province = province;
    customer.provinceCode = provinceCode;

    customer.city = city;
    customer.cityCode = cityCode;

    customer.barangay = barangay;
    customer.barangayCode = barangayCode;

    customer.street = street;
    customer.zipCode = zipCode;

    await customer.save();

    return NextResponse.json({
      success: true,
      message: "Additional information updated successfully.",
      customer,
    });
  } catch (err: any) {
    console.error("Additional info error:", err);

    return NextResponse.json(
      {
        error: err.message || "Server error",
      },
      { status: 500 }
    );
  }
} 