import { activeCustomerPromo, customerPromoRequest } from "@/lib/customer-promos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() { return customerPromoRequest(activeCustomerPromo); }
