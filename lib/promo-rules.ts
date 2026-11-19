export const PROMO_TIMEZONE = "Asia/Manila";
export const PROMO_SORT = { priority: -1, createdAt: 1, _id: 1 } as const;

export interface CustomerPromo {
  id: string;
  title: string;
  link: string;
  imageUrl: string;
  rewardId?: string;
}

export interface PromoResponse {
  promo: CustomerPromo | null;
  dayKey: string;
  serverTime: string;
  validUntil: string;
}

export function activePromoFilter(now: Date) {
  return {
    enabled: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] },
    ],
  };
}

// Philippine time is UTC+8 year-round. Use server time, not the device clock.
export function promoDayWindow(now: Date, endsAt?: Date | null) {
  const offset = 8 * 60 * 60 * 1000;
  const local = new Date(now.getTime() + offset);
  const dayKey = local.toISOString().slice(0, 10);
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1) - offset;
  return {
    dayKey,
    serverTime: now.toISOString(),
    validUntil: new Date(Math.min(midnight, endsAt?.getTime() ?? midnight)).toISOString(),
  };
}

export function safePromoLink(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}
