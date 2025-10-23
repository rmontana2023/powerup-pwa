// models/ActionLog.ts
import mongoose, { Schema, model, models } from "mongoose";

const actionLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    username: { type: String, required: false },
    action: { type: String, required: true },
    before: { type: Schema.Types.Mixed }, // store old data
    after: { type: Schema.Types.Mixed }, // store new data
    ip: { type: String, required: false },
  },
  { timestamps: true }
);

export const ActionLog = models.ActionLog || model("ActionLog", actionLogSchema);
