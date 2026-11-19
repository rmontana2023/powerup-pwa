import { Schema, model, models } from "mongoose";

const voucherSchema = new Schema({
  rewardId: { type: String, default: "" },
  rewardTitle: { type: String, default: "" },
  rewardKind: { type: String, enum: ["cash", "item"], default: "cash" },
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true }, // points or peso
  points: { type: Number, required: true }, // points or peso
  pointsLocked: { type: Number, default: 0 },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  redeemed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Voucher || model("Voucher", voucherSchema);
