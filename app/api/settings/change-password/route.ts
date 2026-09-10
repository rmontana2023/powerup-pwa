import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { getVerifiedCustomer } from "@/lib/server-auth";
import { getPasswordError } from "@/lib/password-validation";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const auth = await getVerifiedCustomer();
    if (!auth || !/^[a-f\d]{24}$/i.test(auth.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    const passwordError = getPasswordError(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    await connectDB();
    const user = await Customer.findById(auth.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json({ error: "New password must differ from your current password." }, { status: 400 });
    }

    // Update only credentials, avoiding unrelated validation on older profiles.
    // Match the old hash so concurrent password changes cannot overwrite each other.
    const result = await Customer.updateOne(
      { _id: user._id, password: user.password },
      {
        $set: { password: await bcrypt.hash(newPassword, 10) },
        $unset: { resetToken: "", resetTokenExpires: "" },
      },
    );
    if (result.modifiedCount !== 1) {
      return NextResponse.json({ error: "Password changed during this request. Please log in again." }, { status: 409 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({ name: "token", value: "", expires: new Date(0), path: "/" });
    return response;
  } catch (err) {
    console.error("Change password failed:", err);
    return NextResponse.json({ error: "Unable to change password. Please try again." }, { status: 500 });
  }
}
