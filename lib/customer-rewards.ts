import { getPromoModel } from "@/lib/promo-db";
import { activeRewardsFilter } from "@/lib/rewards";
export async function availableRewards(accountType: string) {
  const Promo = await getPromoModel();
  return Promo.db.db!.collection("rewards").find({ ...activeRewardsFilter(), accountType: { $in: [accountType, "all"] } }).sort({ points: 1, createdAt: 1 }).toArray();
}
