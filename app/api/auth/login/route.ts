import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    await connectDB();

    // 1️⃣ Try finding admin in User collection first
    let user = await User.findOne({ email });
    let role = "admin";

    // 2️⃣ If not found, try customer
    if (!user) {
      user = await Customer.findOne({ email });
      role = "customer";
    }

    // 3️⃣ If still not found
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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

    // 7️⃣ Send response based on role
    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
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
