import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = [
  "/login",
  "/register",
  "/verify-account",
  "/reset-password",
  "/favicon.ico",
  "/manifest.json",
  "/sw.js",   
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public pages
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

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url), {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    const role = payload.role as string;
    const isVerified = payload.isVerified as boolean;

    // This PWA has no cashier interface. Cashier accounts must use their
    // dedicated portal and cannot fall through to customer/admin pages.
    if (role === "cashier") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ============================
    // CUSTOMER NOT VERIFIED
    // ============================
    if (
      role === "customer" &&
      !isVerified &&
      pathname !== "/verify-account"
    ) {
      return NextResponse.redirect(new URL("/verify-account", req.url));
    }

    // ============================
    // VERIFIED CUSTOMER trying to open verify page
    // ============================
    if (
      role === "customer" &&
      isVerified &&
      pathname === "/verify-account"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ============================
    // CUSTOMER -> ADMIN BLOCK
    // ============================
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ============================
    // ADMIN -> CUSTOMER BLOCK
    // ============================
    if (
      role === "admin" &&
      !pathname.startsWith("/admin") &&
      pathname !== "/"
    ) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", req.url)
      );
    }

    // ============================
    // ROOT
    // ============================
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(
          role === "admin"
            ? "/admin/dashboard"
            : isVerified
            ? "/dashboard"
            : "/verify-account",
          req.url
        )
      );
    }

    return NextResponse.next({
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(err);

    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next|icons).*)"],
};
