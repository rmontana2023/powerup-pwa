import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = ["/login", "/register", "/reset-password", "/favicon.ico", "/manifest.json"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow public and API paths
  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next({
      headers: { "Cache-Control": "no-store" },
    });
  }

  const token = req.cookies.get("token")?.value;

  // 🚫 No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url), {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const role = payload.role as string;

    console.log("✅ Middleware verified:", { path: pathname, role });

    // CUSTOMER trying to access admin pages → block
    if (pathname.startsWith("/admin") && role !== "admin") {
      console.log("CUSTOMER trying to access admin pages → block");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ADMIN trying to access customer pages → block
    if (!pathname.startsWith("/admin") && role === "admin" && pathname !== "/") {
      console.log("ADMIN trying to access customer pages → block");
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // ✅ Root redirect
    if (pathname === "/") {
      const redirectPath = role === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(redirectPath, req.url), {
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.next({
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("❌ Middleware: invalid or expired token", error);
    return NextResponse.redirect(new URL("/login", req.url), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export const config = {
  matcher: ["/((?!_next|icons).*)"],
};
