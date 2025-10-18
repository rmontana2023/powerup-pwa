import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
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
  },
  { timestamps: true }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
