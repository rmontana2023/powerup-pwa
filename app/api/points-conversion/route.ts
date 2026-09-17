import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getVerifiedCustomer } from "@/lib/server-auth";
import { PointsConversion } from "@/models/PointsConversion";

export async function GET() {
  try {
    if (!(await getVerifiedCustomer())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const conversion = await PointsConversion.findOne()
      .sort({ createdAt: -1 })
      .select("points liters -_id");

    if (!conversion) {
      return NextResponse.json({ error: "Conversion not configured" }, { status: 404 });
    }

    if (
      !Number.isFinite(conversion.points) || conversion.points <= 0 ||
      !Number.isFinite(conversion.liters) || conversion.liters <= 0
    ) {
      return NextResponse.json({ error: "Invalid conversion" }, { status: 500 });
    }

    return NextResponse.json(
      { points: conversion.points, liters: conversion.liters },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("GET /api/points-conversion error:", error);
    return NextResponse.json({ error: "Failed to fetch conversion" }, { status: 500 });
  }
}
