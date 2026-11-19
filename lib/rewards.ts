export interface RewardOption {
  _id: string;
  title: string;
  kind: "cash" | "item";
  points: number;
  amount: number;
  accountType: "ordinary" | "fleet" | "all";
  source: "standard" | "promo";
  promoId?: string;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
}
export const STANDARD_REWARDS = [
  { key: "ordinary-50", accountType: "ordinary", points: 50, amount: 20 },
  { key: "ordinary-100", accountType: "ordinary", points: 100, amount: 40 },
  { key: "ordinary-250", accountType: "ordinary", points: 250, amount: 100 },
  { key: "ordinary-500", accountType: "ordinary", points: 500, amount: 250 },
  { key: "fleet-1000", accountType: "fleet", points: 1000, amount: 500 },
  { key: "fleet-2000", accountType: "fleet", points: 2000, amount: 1200 },
  { key: "fleet-5000", accountType: "fleet", points: 5000, amount: 3500 },
] as const;
export type PromoRewardSpec = { mode: "new"; title: string; kind: "cash" | "item"; points: number; amount: number; accountType: "ordinary" | "fleet" | "all" };
export function validatePromoReward(value: unknown): PromoRewardSpec {
  if (!value || typeof value !== "object") throw new Error("Choose a valid promo reward option.");
  const input = value as Record<string, unknown>;
  if (input.mode !== "new") throw new Error("Add the reward to create with this promo.");
  if (typeof input.title !== "string" || !input.title.trim() || input.title.trim().length > 120) throw new Error("Enter a reward name up to 120 characters.");
  if (input.kind !== "cash" && input.kind !== "item") throw new Error("Choose cash voucher or item reward.");
  if (typeof input.points !== "number" || !Number.isSafeInteger(input.points) || input.points < 1 || input.points > 1_000_000) throw new Error("Reward points must be a whole number from 1 to 1,000,000.");
  if (!["ordinary", "fleet", "all"].includes(String(input.accountType))) throw new Error("Choose an eligible account type.");
  if (typeof input.amount !== "number" || !Number.isSafeInteger(input.amount) || input.amount < 1 || input.amount > 1_000_000) throw new Error("Enter a cash value from 1 to 1,000,000.");
  return { mode: "new", title: input.title.trim(), kind: input.kind, points: input.points, amount: input.amount, accountType: input.accountType as "ordinary" | "fleet" | "all" };
}
export function activeRewardsFilter(now = new Date()) {
  return { catalog: true, enabled: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] }] };
}
