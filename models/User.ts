import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
  role: { type: String, enum: ["admin", "cashier"], default: "cashier" },
  name: String,
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
