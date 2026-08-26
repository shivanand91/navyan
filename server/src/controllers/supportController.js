import { SupportTicket } from "../models/SupportTicket.js";
import { Notification } from "../models/Notification.js";

/**
 * Student creates a new question / ticket
 */
export const createTicket = async (req, res, next) => {
  try {
    const { subject, category, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and question text are required." });
    }

    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const studentName = req.user.profile?.fullName || req.user.fullName || "Student";

    const ticket = await SupportTicket.create({
      ticketId,
      student: req.user._id,
      subject: subject.trim(),
      category: category || "General",
      messages: [
        {
          sender: req.user._id,
          senderRole: "student",
          senderName: studentName,
          text: message.trim()
        }
      ],
      isReadByStudent: true,
      isReadByAdmin: false,
      lastRepliedAt: new Date()
    });

    res.status(201).json({
      message: "Your question has been submitted to Navyan mentors.",
      ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Student fetches their own questions / tickets
 */
export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ student: req.user._id })
      .sort({ updatedAt: -1 });

    res.status(200).json({ tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single ticket by ID
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id).populate(
      "student",
      "fullName email profile"
    );

    if (!ticket) {
      return res.status(404).json({ message: "Query thread not found." });
    }

    // Check authorization
    const isOwner = String(ticket.student._id || ticket.student) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this ticket." });
    }

    // Mark read
    if (isOwner && !ticket.isReadByStudent) {
      ticket.isReadByStudent = true;
      await ticket.save();
    } else if (isAdmin && !ticket.isReadByAdmin) {
      ticket.isReadByAdmin = true;
      await ticket.save();
    }

    res.status(200).json({ ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * Reply to an existing question thread (Student or Admin)
 */
export const replyToTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty." });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Query thread not found." });
    }

    const isOwner = String(ticket.student) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to reply to this ticket." });
    }

    const senderName = isAdmin
      ? "Navyan Mentor / Admin"
      : req.user.profile?.fullName || req.user.fullName || "Student";

    const senderRole = isAdmin ? "admin" : "student";

    ticket.messages.push({
      sender: req.user._id,
      senderRole,
      senderName,
      text: message.trim()
    });

    ticket.lastRepliedAt = new Date();

    if (isAdmin) {
      ticket.isReadByAdmin = true;
      ticket.isReadByStudent = false;

      if (status && ["In Progress", "Resolved", "Closed"].includes(status)) {
        ticket.status = status;
      } else if (ticket.status === "Open") {
        ticket.status = "In Progress";
      }

      // Notify student in-app bell!
      try {
        await Notification.create({
          user: ticket.student,
          title: `Reply on your doubt: ${ticket.subject}`,
          message: `${senderName}: "${message.trim().substring(0, 80)}${message.length > 80 ? "..." : ""}"`,
          link: "/student/support",
          type: "General"
        });
      } catch (notifErr) {
        console.error("Failed to create in-app notification for support reply:", notifErr);
      }
    } else {
      ticket.isReadByStudent = true;
      ticket.isReadByAdmin = false;
      if (ticket.status === "Resolved" || ticket.status === "Closed") {
        ticket.status = "Open";
      }
    }

    await ticket.save();

    res.status(200).json({ message: "Reply sent successfully.", ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all student tickets with filtering and search
 */
export const getAllTicketsAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    let tickets = await SupportTicket.find(filter)
      .populate("student", "fullName email profile")
      .sort({ updatedAt: -1 });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      tickets = tickets.filter((t) => {
        const studentName = t.student?.profile?.fullName || t.student?.fullName || "";
        const studentEmail = t.student?.email || "";
        const studentId = String(t.student?._id || "");
        const ticketId = t.ticketId || "";
        const subject = t.subject || "";

        return (
          studentName.toLowerCase().includes(q) ||
          studentEmail.toLowerCase().includes(q) ||
          studentId.toLowerCase().includes(q) ||
          ticketId.toLowerCase().includes(q) ||
          subject.toLowerCase().includes(q)
        );
      });
    }

    const unreadCount = await SupportTicket.countDocuments({ isReadByAdmin: false });

    res.status(200).json({ tickets, unreadCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update ticket status
 */
export const updateTicketStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Open", "In Progress", "Resolved", "Closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("student", "fullName email profile");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    res.status(200).json({ message: `Status updated to ${status}`, ticket });
  } catch (error) {
    next(error);
  }
};
