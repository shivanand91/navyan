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

const TASK_LINK_VISIBLE_STATUSES = [
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested",
  "Completed"
];

const panelClass =
  "rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 backdrop-blur-sm";
const panelGradientClass =
  "rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 backdrop-blur-sm";
const titleClass = "font-semibold text-[color:var(--text)]";
const labelClass = "text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)]";
const mutedClass = "text-sm text-[color:var(--text-secondary)]";

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
    <div className="min-h-screen w-full bg-[color:var(--bg)] text-[color:var(--text)]">
      {/* Header with Welcome */}
      <div className="sticky top-0 z-10 border-b border-[color:var(--border)] bg-[color:var(--sidebar)]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Your Journey</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--text)]">Welcome back</h1>
              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">Track your internships and achievements</p>
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
                className="group relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 backdrop-blur-sm transition hover:border-primary/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white p-3 mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-[color:var(--text-muted)]">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-[color:var(--text)]">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Profile Completion and Active Tracks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion Card */}
          <div className={`${panelGradientClass} overflow-hidden`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className={labelClass}>Profile Readiness</p>
                <p className="mt-2 text-3xl font-bold text-[color:var(--text)]">{completion.percentage}%</p>
              </div>
              <Zap className="h-6 w-6 text-amber-400" />
            </div>

            <div className="mb-4 h-3 overflow-hidden rounded-full bg-[color:var(--card-elevated)]">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>

            <p className="mb-4 text-sm text-[color:var(--text-secondary)]">
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
          <div className={`lg:col-span-2 ${panelClass}`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className={labelClass}>Active Internships</p>
                <p className="mt-2 text-2xl font-bold text-[color:var(--text)]">{activeApplications.length}</p>
              </div>
              <Link to="/student/applications">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {activeApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="mb-3 text-sm text-[color:var(--text-secondary)]">No active internships yet</p>
                <Link to="/student/internships">
                  <Button size="sm">Explore Internships</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeApplications.slice(0, 3).map((app) => (
                  <div key={app._id} className="flex items-center justify-between rounded-xl bg-[color:var(--card-elevated)] p-3 transition hover:bg-primary/10">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[color:var(--text)]">{app.internship?.title}</p>
                      <p className="mt-1 text-xs text-[color:var(--text-muted)]">{app.durationKey}</p>
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
              <h2 className="mb-4 text-xl font-bold text-[color:var(--text)]">Current Internships</h2>

              {activeApplications.length === 0 ? (
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-12 text-center backdrop-blur-sm">
                  <Target className="h-12 w-12 mx-auto text-slate-500 mb-4 opacity-50" />
                  <p className="mb-4 text-[color:var(--text-secondary)]">Start your first internship journey</p>
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
                      className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] backdrop-blur-sm transition hover:border-primary/30"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-[color:var(--text)]">{application.internship?.title}</h3>
                            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                              {application.durationKey} • {start && end ? `${start.toLocaleDateString()} to ${end.toLocaleDateString()}` : "Dates TBD"}
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-[color:var(--text-muted)]">Progress</span>
                            <span className="text-xs font-semibold text-[color:var(--text-secondary)]">
                              {progressPercentage}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[color:var(--card-elevated)]">
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
                              ? "border border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-300"
                              : "border border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          }`}>
                            <Clock className="h-3 w-3" />
                            {leftDays > 0 ? `${leftDays} days left` : "Ending soon"}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {application.offerLetter?.accessToken ? (
                            <Link to={`/documents/offer-letter/${application.offerLetter.accessToken}`}>
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4 mr-2" />
                                Offer Letter
                              </Button>
                            </Link>
                          ) : application.offerLetter?.url ? (
                            <a href={application.offerLetter.url} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4 mr-2" />
                                Offer Letter
                              </Button>
                            </a>
                          ) : null}
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
            <div className={panelGradientClass}>
              <div className="flex items-center justify-between mb-4">
                <BadgeCheck className="h-6 w-6 text-emerald-400" />
                <span className="text-2xl font-bold text-[color:var(--text)]">{certificates.length}</span>
              </div>
              <p className="mb-3 text-sm text-[color:var(--text-secondary)]">
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
            <div className={panelClass}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className={titleClass}>Quick Tips</h3>
              </div>

              <div className="space-y-3">
                <div className="text-sm">
                  <p className="mb-1 font-medium text-[color:var(--text-secondary)]">📋 Profile Tips</p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {completion.percentage < 85 ? "Complete more profile fields to improve your chances." : "Your profile looks great!"}
                  </p>
                </div>

                <div className="text-sm">
                  <p className="mb-1 font-medium text-[color:var(--text-secondary)]">🎯 Next Step</p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {activeApplications.length
                      ? "Keep track of submissions and deadlines."
                      : "Explore internships and submit your first application."}
                  </p>
                </div>

                <div className="text-sm">
                  <p className="mb-1 font-medium text-[color:var(--text-secondary)]">🏆 Achievement</p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {completedApplications.length
                      ? "You've completed internships! Share your certificates."
                      : "Work towards completing your first internship."}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={panelClass}>
              <h3 className="mb-4 font-semibold text-[color:var(--text)]">Recent Activity</h3>
              {applications.length === 0 ? (
                <p className="text-sm text-[color:var(--text-secondary)]">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app._id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-[color:var(--text-secondary)]">{app.internship?.title}</p>
                        <p className="text-xs text-[color:var(--text-muted)]">
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
