import { customerPromoImage, customerPromoRequest } from "@/lib/customer-promos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  return customerPromoRequest(async () => customerPromoImage(req, (await context.params).id));
}
