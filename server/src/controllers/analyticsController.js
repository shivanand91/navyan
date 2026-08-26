import { Application } from "../models/Application.js";
import { Submission } from "../models/Submission.js";
import { Certificate } from "../models/Certificate.js";
import { Internship } from "../models/Internship.js";
import { ServiceInquiry } from "../models/ServiceInquiry.js";

export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalApplications,
      selectedCandidates,
      pendingReview,
      reviewedSubmissions,
      completedSubmissions,
      certificatesIssued,
      statusGroups,
      recentApplications,
      totalInternships,
      totalSubmissions,
      totalInquiries,
      activeInternshipsCount
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: "Selected" }),
      Submission.countDocuments({ reviewStatus: "Submitted" }),
      Submission.countDocuments({ reviewStatus: "Reviewed" }),
      Submission.countDocuments({ reviewStatus: "Completed" }),
      Certificate.countDocuments(),
      Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Application.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("user", "name email")
        .populate("internship", "title")
        .lean(),
      Internship.countDocuments({ isDeleted: { $ne: true } }),
      Submission.countDocuments(),
      ServiceInquiry.countDocuments(),
      Internship.countDocuments({ isPublished: true, isDeleted: { $ne: true } })
    ]);

    const statusCounts = {
      "Applied": 0,
      "Under Review": 0,
      "Shortlisted": 0,
      "Selected": 0,
      "In Progress": 0,
      "Completed": 0,
      "Rejected": 0
    };

    statusGroups.forEach((g) => {
      if (g._id && statusCounts[g._id] !== undefined) {
        statusCounts[g._id] = g.count;
      }
    });

    res.json({
      totalApplications,
      selectedCandidates,
      pendingReview,
      reviewedSubmissions,
      completedSubmissions,
      certificatesIssued,
      statusCounts,
      recentApplications,
      totalInternships,
      totalSubmissions,
      totalInquiries,
      activeInternshipsCount
    });
  } catch (error) {
    next(error);
  }
};
