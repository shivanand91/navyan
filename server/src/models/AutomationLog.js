import mongoose from "mongoose";

const automationLogSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventType: { type: String, required: true },
    status: {
      type: String,
      enum: ["Sent", "Completed", "Failed"],
      required: true,
      index: true
    },
    message: String,
    error: String
  },
  { timestamps: true }
);

export const AutomationLog = mongoose.model("AutomationLog", automationLogSchema);
