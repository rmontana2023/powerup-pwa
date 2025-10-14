import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    code: { type: String, unique: true, required: true }, // e.g. STN01
  },
  { timestamps: true }
);

export const Station = mongoose.models.Station || mongoose.model("Station", stationSchema);
