import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PointsConversion } from "@/models/PointsConversion";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { logAction } from "@/lib/log";

export async function GET() {
  try {
    await connectDB();

    // Get the latest conversion
    let latest = await PointsConversion.findOne().sort({ createdAt: -1 });
    if (!latest) {
      // Create default if not found
      latest = await PointsConversion.create({ points: 1, liters: 1 });
    }

    return NextResponse.json(latest);
  } catch (err) {
    console.error("GET /points-conversion error:", err);
    return NextResponse.json({ error: "Failed to fetch conversion" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    const { points, liters } = await req.json();

    if (!points || !liters || points <= 0 || liters <= 0) {
      return NextResponse.json({ error: "Invalid values" }, { status: 400 });
    }

    await connectDB();

    // Get current conversion
    const current = await PointsConversion.findOne().sort({ createdAt: -1 });
    const beforeData = current ? { points: current.points, liters: current.liters } : null;

    // Update existing conversion
    const updated = await PointsConversion.findOneAndUpdate(
      {},
      { points, liters },
      { new: true, upsert: true }
    );

    // Log the action with before/after data
    await logAction({
      userId: decoded.id,
      username: decoded.name,
      action: "Update Points Conversion",
      before: beforeData,
      after: { points, liters },
      ip: "", // optionally you can pass the IP from headers if available
    });

    return NextResponse.json({
      success: true,
      message: "Points conversion updated successfully",
      conversion: updated,
    });
  } catch (err) {
    console.error("POST /points-conversion error:", err);
    return NextResponse.json({ error: "Failed to update conversion" }, { status: 500 });
  }
}
