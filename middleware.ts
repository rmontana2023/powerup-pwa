import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = ["/login", "/register", "/favicon.ico", "/manifest.json"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next({
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    console.log("Middleware: token verified", payload);

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url), {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.next({
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.log("Middleware: token invalid or expired", error);
    return NextResponse.redirect(new URL("/login", req.url), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}

export const config = {
  matcher: ["/((?!_next|icons).*)"],
};
