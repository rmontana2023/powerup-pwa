import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    birthDate: {
      type: Date,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    // Address
    street: {
      type: String,
    },

    barangay: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    province: {
      type: String,
      required: true,
    },

    zipCode: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    qrCode: {
      type: String,
      unique: true,
      required: true,
    },

    totalPoints: {
      type: Number,
      default: 0,
    },

    accountType: {
      type: String,
      enum: ["ordinary", "fleet"],
      default: "ordinary",
      required: true,
    },

    otp: String,
    otpExpires: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
