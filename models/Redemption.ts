// models/Redemption.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRedemption extends Document {
  customerId: mongoose.Types.ObjectId;
  points: number;
  description: string;
  type: "locked" | "redeemed"; // new field
  amount: number;
  createdAt: Date;
  stationId: string;
}

const RedemptionSchema = new Schema<IRedemption>({
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  points: { type: Number, required: true },
  description: { type: String },
  type: { type: String, enum: ["locked", "redeemed"], required: true }, // new field
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  stationId: { type: String, required: true },
});

export const Redemption =
  mongoose.models.Redemption || mongoose.model<IRedemption>("Redemption", RedemptionSchema);
