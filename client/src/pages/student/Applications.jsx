import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [forms, setForms] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/applications/me");
      setApplications(data.applications || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitProject = async (applicationId) => {
    setBusyId(applicationId);
    try {
      await api.post(`/submissions/${applicationId}`, {
        ...forms[applicationId],
        confirmation: true
      });
      toast.success("Project submitted successfully.");
      setForms((prev) => ({ ...prev, [applicationId]: {} }));
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not submit project.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">My applications</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Track each application from &quot;Applied&quot; to &quot;Completed&quot; with a
          clear status and timeline.
        </p>
      </div>
      <Card>
        <CardHeader>
        <CardTitle className="text-sm">Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {applications.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              No applications yet. Once you apply, they appear here with live status
              updates.
            </p>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {app.internship?.title ?? "Internship"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Duration: {app.durationKey} · Applied on{" "}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    {app.timeline && (
                      <div className="mt-3 max-w-md">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Internship progress</span>
                          <span>{app.timeline.daysLeft} days left</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white dark:bg-[#15151e]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${app.timeline.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                {(app.offerLetter?.url || app.internshipMeta?.taskPdfUrl) && (
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                    {app.offerLetter?.url && (
                      <a href={app.offerLetter.url} target="_blank" rel="noreferrer" className="text-primary">
                        Offer letter
                      </a>
                    )}
                    {app.internshipMeta?.taskPdfUrl && (
                      <a
                        href={app.internshipMeta.taskPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary"
                      >
                        Assigned task PDF
                      </a>
                    )}
                  </div>
                )}

                {app.payment?.status && app.payment.status !== "Not Required" && (
                  <div
                    className={`mt-3 rounded-3xl border p-4 ${
                      app.payment.status === "Verified" || app.payment.status === "Linked"
                        ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                        : app.payment.status === "Rejected"
                          ? "border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10"
                          : "border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Payment status:{" "}
                      {app.payment.status === "Pending"
                        ? "Verification pending"
                        : app.payment.status}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Amount: Rs {app.payment.amount} · UTR: {app.payment.utrNumber}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {app.payment.status === "Pending"
                        ? "Your paid application is waiting for admin verification before it moves forward."
                        : app.payment.status === "Rejected"
                          ? "This payment was rejected during review. Contact the admin if you need clarification."
                          : "Payment verified successfully."}
                    </p>
                  </div>
                )}

                {(app.timeline?.submissionWindowOpen || app.status === "Revision Requested") && (
                  <div className="mt-4 space-y-3 rounded-3xl border border-[#e4d4ad] bg-[#f8efdd]/65 p-4 dark:border-[#4b3f29] dark:bg-[#2b2417]/40">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Final submission</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Submit your final project links. Revision requests allow resubmission.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Project title"
                        value={forms[app._id]?.projectTitle || ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [app._id]: { ...prev[app._id], projectTitle: event.target.value }
                          }))
                        }
                      />
                      <Input
                        placeholder="GitHub / code link"
                        value={forms[app._id]?.codeLink || ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [app._id]: { ...prev[app._id], codeLink: event.target.value }
                          }))
                        }
                      />
                      <Input
                        placeholder="Live demo link (optional)"
                        value={forms[app._id]?.liveDemoLink || ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [app._id]: { ...prev[app._id], liveDemoLink: event.target.value }
                          }))
                        }
                      />
                      <Input
                        placeholder="Drive / ZIP link (optional)"
                        value={forms[app._id]?.driveLink || ""}
                        onChange={(event) =>
                          setForms((prev) => ({
                            ...prev,
                            [app._id]: { ...prev[app._id], driveLink: event.target.value }
                          }))
                        }
                      />
                    </div>
                    <Textarea
                      rows={3}
                      placeholder="Project notes or explanation"
                      value={forms[app._id]?.notes || ""}
                      onChange={(event) =>
                        setForms((prev) => ({
                          ...prev,
                          [app._id]: { ...prev[app._id], notes: event.target.value }
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      disabled={busyId === app._id}
                      onClick={() => submitProject(app._id)}
                    >
                      {busyId === app._id ? "Submitting..." : "Submit project"}
                    </Button>
                  </div>
                )}

                {app.submissions?.length > 0 && (
                  <div className="mt-4 space-y-2 rounded-3xl bg-white p-4 dark:bg-[#15151e]">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Submission history</p>
                    {app.submissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="flex flex-col gap-1 rounded-2xl border border-slate-200 px-3 py-2 text-[11px] text-slate-500 dark:border-[#2a2a36] dark:text-slate-400 md:flex-row md:items-center md:justify-between"
                      >
                        <span>
                          Attempt {submission.attemptNumber} ·{" "}
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                        <StatusBadge status={submission.reviewStatus} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
