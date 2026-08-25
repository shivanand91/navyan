import "../config/env.js";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Internship } from "../models/Internship.js";
import { Application } from "../models/Application.js";
import { AutomationEvent } from "../models/AutomationEvent.js";
import { AutomationLog } from "../models/AutomationLog.js";
import { scheduleInternshipLifecycleEvents } from "./automationScheduler.js";
import { processPendingEvents } from "./automationWorker.js";

async function run() {
  console.log("Connecting to database...");
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27018/navyan");
    console.log("MongoDB connected.");
  } catch (err) {
    console.error("Database connection failed:", err);
    return;
  }

  try {
    // 1. Create a mock student user
    console.log("Creating mock student...");
    const mockStudent = await User.create({
      fullName: "Test Student",
      email: `test_student_${Date.now()}@navyan.online`,
      passwordHash: "dummyhash",
      role: "student"
    });

    // 2. Create a mock internship
    console.log("Creating mock internship...");
    const mockInternship = await Internship.create({
      title: "Test Full Stack Internship",
      role: "Full Stack Developer",
      slug: `test-full-stack-${Date.now()}`,
      shortDescription: "A test internship program for automation verification.",
      durationKey: "4-weeks",
      price: 49,
      projects: ["Task 1", "Task 2", "Task 3"]
    });

    // 3. Create a mock application ending in 2 days
    console.log("Creating mock application...");
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2); // ends in 2 days

    const mockApplication = await Application.create({
      user: mockStudent._id,
      internship: mockInternship._id,
      durationKey: "4-weeks",
      status: "In Progress",
      internshipMeta: {
        startDate: new Date(),
        endDate,
        taskPdfUrl: "https://navyan.online/task.pdf"
      }
    });

    console.log(`Mock Application created with ID: ${mockApplication._id}`);

    // 4. Schedule the lifecycle events
    console.log("Scheduling lifecycle events...");
    await scheduleInternshipLifecycleEvents(mockApplication._id);

    // List scheduled events
    const scheduled = await AutomationEvent.find({ application: mockApplication._id });
    console.log(`Scheduled ${scheduled.length} events:`);
    scheduled.forEach(e => {
      console.log(` - Event: ${e.eventType}, Scheduled For: ${e.scheduledFor.toLocaleString()}, Status: ${e.status}`);
    });

    // Let's manually backdate one event to test worker processing!
    // We will make the "final-day" event scheduled for 1 hour ago
    console.log("Backdating final-day event to simulate elapsed time...");
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await AutomationEvent.updateOne(
      { application: mockApplication._id, eventType: "final-day" },
      { $set: { scheduledFor: oneHourAgo } }
    );

    // 5. Run the background worker processor
    console.log("Running automation worker...");
    const result = await processPendingEvents();
    console.log("Worker execution result:", result);

    // Verify event status and logs
    const executedEvent = await AutomationEvent.findOne({
      application: mockApplication._id,
      eventType: "final-day"
    });
    console.log(`Executed Event Status: ${executedEvent?.status}, Attempts: ${executedEvent?.attempts}`);

    const logs = await AutomationLog.find({ application: mockApplication._id });
    console.log(`Created ${logs.length} audit logs:`);
    logs.forEach(l => {
      console.log(` - Type: ${l.eventType}, Status: ${l.status}, Message: ${l.message}`);
    });

    // 6. Cleanup mock data
    console.log("Cleaning up mock database records...");
    await AutomationEvent.deleteMany({ application: mockApplication._id });
    await AutomationLog.deleteMany({ application: mockApplication._id });
    await Application.deleteOne({ _id: mockApplication._id });
    await Internship.deleteOne({ _id: mockInternship._id });
    await User.deleteOne({ _id: mockStudent._id });

    console.log("Verification finished successfully! Cleaned up all records.");
  } catch (error) {
    console.error("Verification failed with error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

run();
