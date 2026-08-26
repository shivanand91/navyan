import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderRole: {
      type: String,
      enum: ["student", "admin"],
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["General", "Internship", "Task & Submission", "Certificate", "Technical", "Other"],
      default: "General",
      index: true
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true
    },
    messages: [messageSchema],
    isReadByStudent: {
      type: Boolean,
      default: true
    },
    isReadByAdmin: {
      type: Boolean,
      default: false
    },
    lastRepliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

supportTicketSchema.index({ student: 1, createdAt: -1 });

export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
