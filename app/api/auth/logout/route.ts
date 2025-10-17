import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // ✅ Delete the token cookie by setting it expired
  response.cookies.set({
    name: "token",
    value: "",
    expires: new Date(0), // past date
    path: "/",
  });

  return response;
}
