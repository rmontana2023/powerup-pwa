import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();
    await connectDB();

    // 1️⃣ Try finding admin in User collection first
    let user;
    let role = "admin";

    // 1️⃣ ADMIN LOGIN → email only
    if (identifier.includes("@")) {
      user = await User.findOne({ email: identifier });
    }

    // 2️⃣ CUSTOMER LOGIN → email or phone
    if (!user) {
      user = await Customer.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
      });
      role = "customer";
    }

    // 3️⃣ No user found
    if (!user) {
      return NextResponse.json({ error: "Invalid email/phone or password" }, { status: 401 });
    }

    // 4️⃣ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 5️⃣ Create JWT with role info
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // 6️⃣ Set token in cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    let fullName = "";

    if (role === "admin") {
      fullName = user.name; // Admin still has name field
    } else {
      // Customer → build from firstname + middlename + lastname
      const first = user.firstName || "";
      const middle = user.middleName ? ` ${user.middleName}` : "";
      const last = user.lastName ? ` ${user.lastName}` : "";
      fullName = `${first}${middle}${last}`.trim();
    }
    console.log("User logged in:", fullName);
    // 7️⃣ Send response based on role
    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: fullName,
        email: user.email,
        phone: user.phone,
        role,
        ...(role === "customer"
          ? {
              totalPoints: user.totalPoints,
              qrCode: user.qrCode,
              accountType: user.accountType,
            }
          : {}),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
