import { NextResponse } from "next/server";
import { getVerifiedCustomer } from "@/lib/server-auth";
import { getPromoModel } from "@/lib/promo-db";
import { activePromoFilter, promoDayWindow, PROMO_SORT, safePromoLink } from "@/lib/promo-rules";

const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

export async function customerPromoRequest(action: () => Promise<Response>) {
  try {
    if (!(await getVerifiedCustomer())) {
      return NextResponse.json({ error: "Verified customer access required." }, { status: 401, headers });
    }
    return await action();
  } catch {
    // A promo outage must not prevent customers using the rest of the app.
    return NextResponse.json({ error: "Promotions temporarily unavailable." }, { status: 503, headers });
  }
}

export async function activeCustomerPromo() {
  const Promo = await getPromoModel();
  const now = new Date();
  const promo = await Promo.findOne(activePromoFilter(now))
    .sort(PROMO_SORT)
    .select("title link rewardId endsAt updatedAt")
    .lean();
  const upcoming = await Promo.findOne({ enabled: true, startsAt: { $gt: now }, $or: [{ endsAt: null }, { endsAt: { $gt: now } }] }).sort({ startsAt: 1 }).select("startsAt").lean();
  return NextResponse.json({
    ...promoDayWindow(now, promo?.endsAt),
    nextStartsAt: upcoming?.startsAt?.toISOString() ?? null,
    promo: promo ? {
      id: String(promo._id), title: promo.title, rewardId: promo.rewardId || "", link: safePromoLink(promo.link || ""),
      imageUrl: `/api/promos/${promo._id}/image?v=${encodeURIComponent(promo.updatedAt.toISOString())}`,
    } : null,
  }, { headers });
}

export async function listCustomerPromos() {
  const Promo = await getPromoModel();
  const now = new Date();
  const promos = await Promo.find(activePromoFilter(now))
    .sort(PROMO_SORT)
    .select("title link mechanics rewardId startsAt endsAt updatedAt")
    .lean();
  return NextResponse.json({
    promos: promos.map((promo) => ({
      id: String(promo._id), title: promo.title, rewardId: promo.rewardId || "",
      mechanics: promo.mechanics || "", link: safePromoLink(promo.link || ""),
      startsAt: promo.startsAt?.toISOString() ?? null,
      endsAt: promo.endsAt?.toISOString() ?? null,
      imageUrl: `/api/promos/${promo._id}/image?v=${encodeURIComponent(promo.updatedAt.toISOString())}`,
    })),
  }, { headers });
}

export async function customerPromoImage(req: Request, id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) return new Response(null, { status: 404, headers });
  const version = new URL(req.url).searchParams.get("v");
  if (!version || Number.isNaN(Date.parse(version))) return new Response(null, { status: 404, headers });
  const Promo = await getPromoModel();
  // Recheck schedule and version so paused, expired, deleted or edited images are not delivered.
  const promo = await Promo.findOne({
    ...activePromoFilter(new Date()), _id: id, updatedAt: new Date(version),
  }).select("+image +imageType");
  if (!promo?.image?.length || !["image/png", "image/jpeg", "image/webp"].includes(promo.imageType)) {
    return new Response(null, { status: 404, headers });
  }
  return new Response(new Uint8Array(promo.image), { headers: {
    ...headers, "Content-Type": promo.imageType, "X-Content-Type-Options": "nosniff",
  } });
}
