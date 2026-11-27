import mongoose from "mongoose";

export interface PromoRecord {
  title: string;
  link: string;
  mechanics?: string;
  rewardId?: string;
  enabled: boolean;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  image: Buffer;
  imageType: string;
  createdAt: Date;
  updatedAt: Date;
}

// Read the same collection and fields managed by powerup-dashboard.
export const promoSchema = new mongoose.Schema<PromoRecord>({
  title: String,
  link: String,
  mechanics: String,
  rewardId: String,
  enabled: Boolean,
  priority: Number,
  startsAt: Date,
  endsAt: Date,
  image: { type: Buffer, select: false },
  imageType: { type: String, select: false },
  createdAt: Date,
  updatedAt: Date,
}, { collection: "promos", autoCreate: false, autoIndex: false });
