import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getVerifiedCustomer } from "@/lib/server-auth";
import { REWARD_TIERS } from "@/lib/reward-tiers";
import Voucher from "@/models/Voucher";
import { Customer } from "@/models/Customer";
import { Redemption } from "@/models/Redemption";

class VoucherRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function POST(req: Request) {
  const auth = await getVerifiedCustomer();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const points = Number(body.points);
    const amount = Number(body.amount);

    if (!Number.isFinite(points) || !Number.isFinite(amount)) {
      return NextResponse.json(
        { success: false, error: "Invalid reward selection" },
        { status: 400 },
      );
    }

    await connectDB();

    const session = await mongoose.startSession();
    let createdVoucher: InstanceType<typeof Voucher> | null = null;
    let customerTotalPoints = 0;

    try {
      await session.withTransaction(async () => {
        const customer = await Customer.findById(auth.id).session(session);
        if (!customer) {
          throw new VoucherRequestError("Customer not found", 404);
        }

        const tiers = REWARD_TIERS[customer.accountType] ?? [];
        const selectedTier = tiers.find(
          (tier) => tier.points === points && tier.peso === amount,
        );
        if (!selectedTier) {
          throw new VoucherRequestError("Invalid reward tier", 400);
        }

        const [lockedResult] = await Voucher.aggregate<{ total: number }>([
          { $match: { customerId: customer._id, redeemed: false } },
          { $group: { _id: null, total: { $sum: "$pointsLocked" } } },
        ]).session(session);

        const lockedPoints = lockedResult?.total ?? 0;
        const availablePoints = customer.totalPoints - lockedPoints;
        if (availablePoints < selectedTier.points) {
          throw new VoucherRequestError("Not enough available points", 400);
        }

        // Concurrent reservations touch the same customer document, forcing
        // conflicting transactions to retry with a fresh locked-point balance.
        await Customer.updateOne(
          { _id: customer._id },
          { $inc: { redemptionVersion: 1 } },
          { session },
        );

        const [voucher] = await Voucher.create(
          [
            {
              customerId: customer._id,
              amount: selectedTier.peso,
              points: selectedTier.points,
              pointsLocked: selectedTier.points,
              redeemed: false,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              code: crypto.randomBytes(8).toString("hex").toUpperCase(),
            },
          ],
          { session },
        );

        await Redemption.create(
          [
            {
              customerId: customer._id,
              points: selectedTier.points,
              amount: selectedTier.peso,
              type: "locked",
              description: `Locked points for voucher worth ₱${selectedTier.peso}`,
              stationId: "Manual Redemption",
            },
          ],
          { session },
        );

        createdVoucher = voucher;
        customerTotalPoints = customer.totalPoints;
      });
    } finally {
      await session.endSession();
    }

    if (!createdVoucher) {
      throw new Error("Voucher transaction completed without creating a voucher");
    }

    return NextResponse.json({
      success: true,
      voucher: createdVoucher,
      totalPoints: customerTotalPoints,
    });
  } catch (error) {
    if (error instanceof VoucherRequestError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("Voucher creation error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
