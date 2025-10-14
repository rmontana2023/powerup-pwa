// models/Transaction.ts
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station", // reference to the Station collection
      required: true,
    },
    receiptNo: { type: String, required: true },
    liters: { type: Number, required: true },
    amount: { type: Number, required: true },
    pointsEarned: { type: Number, required: true },
    source: { type: String, enum: ["POS", "Manual"], default: "POS" },
    taggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "taggedAt", updatedAt: false } }
);

export const Transaction =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
