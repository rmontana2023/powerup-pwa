import mongoose, { Schema, models, model } from "mongoose";

const OtpSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },

  code: {
    type: String,
    required: true,
  },

  purpose: {
    type: String,
    enum: ["REGISTER", "VOUCHER"],
    required: true,
    index: true,
  },

  used: {
    type: Boolean,
    default: false,
  },

  expiresAt: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Otp = models.Otp || model("Otp", OtpSchema);
