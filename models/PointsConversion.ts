// models/PointsConversion.ts
import mongoose from "mongoose";

const pointsConversionSchema = new mongoose.Schema(
  {
    points: { type: Number, required: true }, // number of points
    liters: { type: Number, required: true }, // equivalent cash
  },
  { timestamps: true }
);

export const PointsConversion =
  mongoose.models.PointsConversion || mongoose.model("PointsConversion", pointsConversionSchema);
