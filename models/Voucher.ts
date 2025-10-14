import mongoose, { Schema, model, models } from "mongoose";

const voucherSchema = new Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true }, // points or peso
  points: { type: Number, required: true }, // points or peso
  customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  redeemed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }, // 1 week from creation
  createdAt: { type: Date, default: Date.now },
});

export default models.Voucher || model("Voucher", voucherSchema);
