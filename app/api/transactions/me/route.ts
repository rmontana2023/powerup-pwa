import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const exportAll = searchParams.get("export") === "true"; // export mode toggle
    const email = searchParams.get("email"); // optional email param

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    await connectDB();

    // Limit data to 100 for regular fetch
    const transactions = await Transaction.find({ customerId })
      .sort({ taggedAt: -1 })
      .limit(exportAll ? 0 : 100) // limit only when not exporting all
      .lean();

    // If user requests full export and provides email
    if (exportAll && email) {
      // Fetch all transactions for export
      const allTransactions = await Transaction.find({ customerId }).sort({ taggedAt: -1 }).lean();

      // Format CSV
      const csv = [
        "Date,Station,Liters,Amount,Points",
        ...allTransactions.map(
          (t) =>
            `${new Date(t.taggedAt).toLocaleString()},${t.stationId?.name || ""},${t.liters},${
              t.amount
            },${t.pointsEarned}`
        ),
      ].join("\n");

      // Send CSV via email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"PowerUp Rewards" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Full Transaction History",
        text: "Attached is your full transaction history in CSV format.",
        attachments: [
          {
            filename: "transactions.csv",
            content: csv,
          },
        ],
      });

      return NextResponse.json({
        message: "Full transaction history sent to your email.",
      });
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
