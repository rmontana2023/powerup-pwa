import mongoose, { Connection, Model } from "mongoose";
import { PromoRecord, promoSchema } from "@/models/Promo";

declare global {
  var powerupPromoConnection: Promise<Connection> | undefined;
}

export async function getPromoModel(): Promise<Model<PromoRecord>> {
  const uri = process.env.PROMOS_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("Promo database is not configured.");
  if (!global.powerupPromoConnection) {
    global.powerupPromoConnection = mongoose.createConnection(uri, {
      autoCreate: false, autoIndex: false, maxPoolSize: 5, serverSelectionTimeoutMS: 5000,
    }).asPromise().catch((error) => {
      global.powerupPromoConnection = undefined;
      throw error;
    });
  }
  const connection = await global.powerupPromoConnection;
  return (connection.models.Promo as Model<PromoRecord> | undefined)
    ?? connection.model<PromoRecord>("Promo", promoSchema);
}
