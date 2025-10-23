// lib/log.ts
import { connectDB } from "@/lib/db";
import { ActionLog } from "@/models/ActionLog";

interface LogOptions {
  userId?: string;
  username?: string;
  action: string;
  before?: any;
  after?: any;
  ip?: string;
}

export async function logAction({ userId, username, action, before, after, ip }: LogOptions) {
  try {
    await connectDB();
    await ActionLog.create({ userId, username, action, before, after, ip });
  } catch (err) {
    console.error("Failed to log action:", err);
  }
}
