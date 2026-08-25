import mongoose from "mongoose";

const automationEventSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    eventType: {
      type: String,
      enum: [
        "reminder-7-days",
        "reminder-3-days",
        "reminder-2-days",
        "final-day",
        "followup-3-days",
        "auto-rejection-10-days"
      ],
      required: true
    },
    scheduledFor: { type: Date, required: true, index: true },
    executedAt: Date,
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Failed", "Cancelled"],
      default: "Pending",
      index: true
    },
    error: String,
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Prevent duplicate pending/active events of the same type for a single enrollment
automationEventSchema.index({ application: 1, eventType: 1 }, { unique: true });

export const AutomationEvent = mongoose.model("AutomationEvent", automationEventSchema);
