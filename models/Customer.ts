import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    birthDate: { type: Date },
    province: { type: String },
    city: { type: String },
    barangay: { type: String },
    street: { type: String },
    zipCode: { type: String },
    password: { type: String, required: true },
    qrCode: { type: String, unique: true, required: true },
    totalPoints: { type: Number, default: 0 },
    accountType: {
      type: String,
      enum: ["ordinary", "fleet"],
      default: "ordinary",
      required: true,
    },
    otp: { type: String }, // 🔑 store temporary OTP
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false }, // ✅ new field
    resetToken: { type: String }, // 🔑 password reset token
    resetTokenExpires: { type: Date }, // ⏱ token expiration
    lastOtpRequest: { type: Date, default: null },
  },
  { timestamps: true },
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
