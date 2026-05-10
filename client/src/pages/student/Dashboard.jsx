import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { differenceInDays } from "date-fns";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link as RouterLink } from "react-router-dom";

const TASK_LINK_VISIBLE_STATUSES = [
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested",
  "Completed"
];

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [completion, setCompletion] = useState({ percentage: 0 });
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [applicationsRes, profileRes, certificatesRes] = await Promise.all([
          api.get("/applications/me"),
          api.get("/profile/me"),
          api.get("/certificates/me")
        ]);

        setApplications(applicationsRes.data.applications || []);
        setCompletion(profileRes.data.completion || { percentage: 0 });
        setCertificates(certificatesRes.data.certificates || []);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  const activeApplications = useMemo(
    () =>
      applications.filter((application) =>
        ["Selected", "In Progress", "Submission Pending", "Submitted", "Revision Requested"].includes(
          application.status
        )
      ),
    [applications]
  );

  const completedApplications = useMemo(
    () => applications.filter((application) => application.status === "Completed"),
    [applications]
  );

  const nextDeadline = useMemo(() => {
    const days = activeApplications
      .map((application) => application.timeline?.daysLeft)
      .filter((value) => typeof value === "number");

    if (!days.length) return null;
    return Math.min(...days);
  }, [activeApplications]);

  const stats = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: Target,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Active Tracks",
      value: activeApplications.length,
      icon: Flame,
      color: "from-orange-500 to-red-500"
    },
    {
      label: "Certificates",
      value: certificates.length,
      icon: BadgeCheck,
      color: "from-emerald-500 to-teal-500"
    },
    {
      label: "Completed",
      value: completedApplications.length,
      icon: CheckCircle2,
      color: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950 dark:from-slate-950 dark:to-[#0b0d10]">
      {/* Header with Welcome */}
      <div className="border-b border-slate-700/50 dark:border-white/8 bg-slate-900/50 dark:bg-white/3 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Your Journey</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back</h1>
              <p className="text-slate-400 text-sm mt-1">Track your internships and achievements</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {nextDeadline !== null ? `${nextDeadline}d left` : "No deadline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm p-6 hover:border-slate-600 dark:hover:border-white/20 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white p-3 mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Profile Completion and Active Tracks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion Card */}
          <div className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 dark:from-white/5 dark:to-white/3 backdrop-blur-sm overflow-hidden p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Profile Readiness</p>
                <p className="text-3xl font-bold text-white mt-2">{completion.percentage}%</p>
              </div>
              <Zap className="h-6 w-6 text-amber-400" />
            </div>

            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>

            <p className="text-sm text-slate-300 mb-4">
              {completion.percentage < 50
                ? "Start filling your profile to increase chances"
                : completion.percentage < 85
                  ? "Almost there! Complete a few more fields"
                  : "Your profile is in excellent shape"}
            </p>

            <Link to="/student/profile/edit">
              <Button variant="outline" size="sm" className="w-full justify-center">
                {completion.percentage < 100 ? "Complete Profile" : "View Profile"}
              </Button>
            </Link>
          </div>

          {/* Active Tracks Summary */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Internships</p>
                <p className="text-2xl font-bold text-white mt-2">{activeApplications.length}</p>
              </div>
              <Link to="/student/applications">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {activeApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm mb-3">No active internships yet</p>
                <Link to="/student/internships">
                  <Button size="sm">Explore Internships</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeApplications.slice(0, 3).map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{app.internship?.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{app.durationKey}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Internships Details */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Current Internships</h2>

              {activeApplications.length === 0 ? (
                <div className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm p-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-slate-500 mb-4 opacity-50" />
                  <p className="text-slate-400 mb-4">Start your first internship journey</p>
                  <Link to="/student/internships">
                    <Button>Explore Opportunities</Button>
                  </Link>
                </div>
              ) : (
                activeApplications.map((application) => {
                  const start = application.internshipMeta?.startDate ? new Date(application.internshipMeta.startDate) : null;
                  const end = application.internshipMeta?.endDate ? new Date(application.internshipMeta.endDate) : null;
                  const totalDays = start && end ? Math.max(1, differenceInDays(end, start)) : 0;
                  const leftDays = typeof application.timeline?.daysLeft === "number"
                    ? application.timeline.daysLeft
                    : end
                      ? differenceInDays(end, new Date())
                      : 0;
                  const progressPercentage = totalDays
                    ? Math.min(100, Math.max(0, Math.round(((totalDays - leftDays) / totalDays) * 100)))
                    : application.timeline?.progressPercentage || 0;

                  return (
                    <div
                      key={application._id}
                      className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">{application.internship?.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">
                              {application.durationKey} • {start && end ? `${start.toLocaleDateString()} to ${end.toLocaleDateString()}` : "Dates TBD"}
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-400">Progress</span>
                            <span className="text-xs font-semibold text-slate-300">
                              {progressPercentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Deadline Info */}
                        {leftDays !== undefined && (
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold mb-4 ${
                            leftDays < 5
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            <Clock className="h-3 w-3" />
                            {leftDays > 0 ? `${leftDays} days left` : "Ending soon"}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {application.offerLetter?.url && (
                            <a href={application.offerLetter.url} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4 mr-2" />
                                Offer Letter
                              </Button>
                            </a>
                          )}
                          {TASK_LINK_VISIBLE_STATUSES.includes(application.status) && application.internshipMeta?.taskPdfUrl && (
                            <a href={application.internshipMeta.taskPdfUrl} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4 mr-2" />
                                Task Brief
                              </Button>
                            </a>
                          )}
                          <Link to="/student/applications">
                            <Button size="sm" className="ml-auto">
                              View Details <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar - Quick Stats & Recommendations */}
          <div className="space-y-4">
            {/* Certificates Card */}
            <div className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 dark:from-white/5 dark:to-white/3 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <BadgeCheck className="h-6 w-6 text-emerald-400" />
                <span className="text-2xl font-bold text-white">{certificates.length}</span>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                {certificates.length === 0
                  ? "Complete an internship to earn your first certificate"
                  : `${certificates.length} certificate${certificates.length === 1 ? "" : "s"} unlocked`}
              </p>
              {certificates.length > 0 && (
                <Link to="/student/certificates">
                  <Button variant="outline" size="sm" className="w-full">
                    View Certificates
                  </Button>
                </Link>
              )}
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-white">Quick Tips</h3>
              </div>

              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-slate-300 font-medium mb-1">📋 Profile Tips</p>
                  <p className="text-slate-400 text-xs">
                    {completion.percentage < 85 ? "Complete more profile fields to improve your chances." : "Your profile looks great!"}
                  </p>
                </div>

                <div className="text-sm">
                  <p className="text-slate-300 font-medium mb-1">🎯 Next Step</p>
                  <p className="text-slate-400 text-xs">
                    {activeApplications.length
                      ? "Keep track of submissions and deadlines."
                      : "Explore internships and submit your first application."}
                  </p>
                </div>

                <div className="text-sm">
                  <p className="text-slate-300 font-medium mb-1">🏆 Achievement</p>
                  <p className="text-slate-400 text-xs">
                    {completedApplications.length
                      ? "You've completed internships! Share your certificates."
                      : "Work towards completing your first internship."}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm p-6">
              <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
              {applications.length === 0 ? (
                <p className="text-sm text-slate-400">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app._id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-300 truncate">{app.internship?.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
