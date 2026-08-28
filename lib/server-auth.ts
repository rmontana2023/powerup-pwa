import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

// "customer" identifies the Customer collection in the signed session. It is
// not a field that needs to exist on Customer documents.
export type AppRole = "admin" | "cashier" | "customer";

export interface AuthUser {
  id: string;
  role: AppRole;
  isVerified: boolean;
}

interface TokenPayload extends JwtPayload {
  id?: unknown;
  role?: unknown;
  isVerified?: unknown;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const secret = process.env.JWT_SECRET;
  const token = (await cookies()).get("token")?.value;

  if (!secret || !token) return null;

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    if (
      typeof payload.id !== "string" ||
      payload.role !== "admin" &&
      payload.role !== "cashier" &&
      payload.role !== "customer"
    ) {
      return null;
    }

    return {
      id: payload.id,
      role: payload.role,
      isVerified: payload.role !== "customer" || payload.isVerified === true,
    };
  } catch {
    return null;
  }
}

export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  return user?.role === "admin" ? user : null;
}

export async function getVerifiedCustomer(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  return user?.role === "customer" && user.isVerified ? user : null;
}
