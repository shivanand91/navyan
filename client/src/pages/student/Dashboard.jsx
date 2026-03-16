import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { differenceInDays } from "date-fns";
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  FileBadge2,
  FileText,
  Layers3,
  Rocket,
  TimerReset,
  Trophy,
  UserRound
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/premium/MetricCard";
import { RevealInView } from "@/components/premium/RevealInView";

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

  return (
    <div className="space-y-8">
      <RevealInView>
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="navyan-card px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="navyan-pill">Student overview</div>
                <div className="space-y-2">
                  <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-[#f5f7fa]">
                    Your internship journey is visible, organized, and moving.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                    This dashboard keeps your profile readiness, applications, active tasks,
                    certificates, and next actions in one calm workspace.
                  </p>
                </div>
              </div>
              <div className="rounded-[22px] border border-primary/18 bg-primary/10 px-4 py-3 text-primary">
                <p className="text-[11px] uppercase tracking-[0.18em]">Next deadline</p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {nextDeadline !== null ? `${nextDeadline}d` : "--"}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/8 bg-white/5 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                      Profile completion
                    </p>
                    <p className="mt-2 font-display text-4xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                      {completion.percentage}%
                    </p>
                  </div>
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/5 dark:bg-white/6">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
                <Link
                  to="/student/profile/edit"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Improve profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-[#101419]/94 px-5 py-5 text-[#f5f7fa]">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7e8794]">Application pulse</p>
                <div className="mt-5 space-y-3">
                  {["Applied", "Under Review", "Shortlisted", "Selected"].map((status) => {
                    const count = applications.filter((application) => application.status === status).length;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <p className="text-sm text-[#b7c0cc]">{status}</p>
                        <p className="font-display text-lg font-semibold text-[#f5f7fa]">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-[#101419]/94 px-5 py-5 text-[#f5f7fa]">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7e8794]">Reward state</p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-4 w-4 text-success" />
                    <p className="text-sm text-[#b7c0cc]">
                      {certificates.length} certificate{certificates.length === 1 ? "" : "s"} unlocked
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Compass className="h-4 w-4 text-primary" />
                    <p className="text-sm text-[#b7c0cc]">{activeApplications.length} active internship track(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Rocket className="h-4 w-4 text-accent" />
                    <p className="text-sm text-[#b7c0cc]">{completedApplications.length} completed milestone(s)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <MetricCard
              label="Applications"
              value={applications.length}
              hint="Total"
              icon={Layers3}
              tone="gold"
            />
            <MetricCard
              label="Active tracks"
              value={activeApplications.length}
              hint="Current"
              icon={TimerReset}
              tone="cyan"
            />
            <MetricCard
              label="Certificates"
              value={certificates.length}
              hint="Unlocked"
              icon={FileBadge2}
              tone="success"
            />
            <MetricCard
              label="Completed"
              value={completedApplications.length}
              hint="Milestones"
              icon={Trophy}
              tone="violet"
            />
          </div>
        </div>
      </RevealInView>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <RevealInView className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                Active internships
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                What needs your attention right now.
              </h2>
            </div>
            <Link to="/student/applications">
              <Button variant="outline">Open all</Button>
            </Link>
          </div>

          {activeApplications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-sm text-slate-600 dark:text-[#b7c0cc]">
                You do not have an active internship yet. Explore open roles and start a track.
              </CardContent>
            </Card>
          ) : (
            activeApplications.map((application) => {
              const start = application.internshipMeta?.startDate
                ? new Date(application.internshipMeta.startDate)
                : null;
              const end = application.internshipMeta?.endDate
                ? new Date(application.internshipMeta.endDate)
                : null;
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
                <Card key={application._id}>
                  <CardHeader className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <CardTitle>{application.internship?.title || "Internship"}</CardTitle>
                      <p className="text-sm text-slate-600 dark:text-[#b7c0cc]">
                        {application.durationKey} cohort
                        {start && end
                          ? ` • ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#7e8794]">
                        <span>Progress</span>
                        <span>{leftDays > 0 ? `${leftDays} days left` : "Final stage"}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-black/5 dark:bg-white/6">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {application.offerLetter?.url ? (
                        <a href={application.offerLetter.url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Offer letter
                          </Button>
                        </a>
                      ) : null}
                      {application.internshipMeta?.taskPdfUrl ? (
                        <a href={application.internshipMeta.taskPdfUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost">
                            Task PDF
                          </Button>
                        </a>
                      ) : null}
                      <Link to="/student/applications">
                        <Button size="sm">Track workflow</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </RevealInView>

        <RevealInView className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent movement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-[#b7c0cc]">
                  Once you apply, your latest activity and next step cues will appear here.
                </p>
              ) : (
                applications.slice(0, 5).map((application) => (
                  <div
                    key={application._id}
                    className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                          {application.internship?.title || "Internship"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#7e8794]">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended next moves</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: completion.percentage < 85 ? "Strengthen your profile" : "Profile looks strong",
                  description:
                    completion.percentage < 85
                      ? "Complete more profile fields to improve readiness and reduce application friction."
                      : "Your profile is in a strong state for future applications."
                },
                {
                  title: activeApplications.length ? "Stay ahead of the submission window" : "Explore a new internship",
                  description:
                    activeApplications.length
                      ? "Monitor task progress and keep your deliverables ready before the final submission window opens."
                      : "Browse open internships and start a new workflow from the internships tab."
                },
                {
                  title: certificates.length ? "Use your certificates as proof" : "Aim for your first certificate",
                  description:
                    certificates.length
                      ? "Share your verified certificates in your portfolio, resume, and LinkedIn applications."
                      : "Selected interns who complete their workflow receive publicly verifiable certificates."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                    {item.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </RevealInView>
      </div>
    </div>
  );
}
