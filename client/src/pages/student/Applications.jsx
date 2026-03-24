import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/premium/ModalShell";
import { toast } from "sonner";

const TASK_WORKSPACE_STATUSES = [
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested"
];

const TASK_LINK_VISIBLE_STATUSES = [...TASK_WORKSPACE_STATUSES, "Completed"];
const PROJECT_SLOT_COUNT = 3;

const buildDefaultTaskNumber = (application) =>
  `TASK-${String(application?._id || "").slice(-5).toUpperCase()}`;

const buildDefaultProjects = (application) => {
  const latestSubmission = application?.submissions?.[0];
  const sourceProjects =
    latestSubmission?.projects?.length
      ? latestSubmission.projects
      : [
          {
            projectName: latestSubmission?.projectTitle || "",
            codeLink: latestSubmission?.codeLink || "",
            liveDemoLink: latestSubmission?.liveDemoLink || ""
          }
        ];

  return Array.from({ length: PROJECT_SLOT_COUNT }, (_, index) => ({
    projectName: sourceProjects[index]?.projectName || "",
    codeLink: sourceProjects[index]?.codeLink || "",
    liveDemoLink: sourceProjects[index]?.liveDemoLink || ""
  }));
};

const buildDefaultFormState = (application) => {
  const latestSubmission = application?.submissions?.[0];

  return {
    studentName: application?.studentName || latestSubmission?.studentName || "",
    taskName:
      latestSubmission?.taskName ||
      latestSubmission?.projectTitle ||
      application?.internship?.role ||
      application?.internship?.title ||
      "",
    taskNumber: latestSubmission?.taskNumber || buildDefaultTaskNumber(application),
    projects: buildDefaultProjects(application),
    driveLink: "",
    notes: ""
  };
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [forms, setForms] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/applications/me");
      const nextApplications = data.applications || [];
      setApplications(nextApplications);
      setForms((prev) =>
        Object.fromEntries(
          nextApplications.map((application) => [
            application._id,
            {
              ...buildDefaultFormState(application),
              ...(prev[application._id] || {})
            }
          ])
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeSubmissionApplication = applications.find(
    (application) => application._id === activeSubmissionId
  );

  const updateFormField = (applicationId, key, value) => {
    setForms((prev) => ({
      ...prev,
      [applicationId]: { ...prev[applicationId], [key]: value }
    }));
  };

  const updateProjectField = (applicationId, projectIndex, key, value) => {
    setForms((prev) => ({
      ...prev,
      [applicationId]: {
        ...prev[applicationId],
        projects: (prev[applicationId]?.projects || []).map((project, index) =>
          index === projectIndex ? { ...project, [key]: value } : project
        )
      }
    }));
  };

  const submitProject = async (applicationId) => {
    setBusyId(applicationId);
    try {
      await api.post(`/submissions/${applicationId}`, {
        ...forms[applicationId],
        confirmation: true
      });
      toast.success("Task submission saved successfully.");
      setActiveSubmissionId(null);
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

                {(app.offerLetter?.url ||
                  (TASK_LINK_VISIBLE_STATUSES.includes(app.status) && app.internshipMeta?.taskPdfUrl)) && (
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                    {app.offerLetter?.url && (
                      <a href={app.offerLetter.url} target="_blank" rel="noreferrer" className="text-primary">
                        Offer letter
                      </a>
                    )}
                    {TASK_LINK_VISIBLE_STATUSES.includes(app.status) && app.internshipMeta?.taskPdfUrl && (
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

                {app.internalNotes ? (
                  <div className="mt-3 rounded-3xl border border-slate-200 bg-white/80 p-4 dark:border-white/8 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Admin notes
                    </p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                      {app.internalNotes}
                    </p>
                  </div>
                ) : null}

                {TASK_WORKSPACE_STATUSES.includes(app.status) && (
                  <div className="mt-4 rounded-3xl border border-[#e4d4ad] bg-[#f8efdd]/65 p-4 dark:border-[#4b3f29] dark:bg-[#2b2417]/40">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Task submission workspace
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Open a dedicated modal and submit all 3 project links together.
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setActiveSubmissionId(app._id)}>
                        Open submission workspace
                      </Button>
                    </div>
                  </div>
                )}

                {app.submissions?.length > 0 && (
                  <div className="mt-4 space-y-2 rounded-3xl bg-white p-4 dark:bg-[#15151e]">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Submission history</p>
                    {app.submissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="flex flex-col gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-[11px] text-slate-500 dark:border-[#2a2a36] dark:text-slate-400"
                      >
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <span>
                            Attempt {submission.attemptNumber} ·{" "}
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          <StatusBadge status={submission.reviewStatus} />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <span>Task: {submission.taskName || submission.projectTitle}</span>
                          <span>Task no: {submission.taskNumber || "Not added"}</span>
                        </div>
                        <div className="grid gap-2 md:grid-cols-3">
                          {(submission.projects?.length
                            ? submission.projects
                            : [
                                {
                                  projectName: submission.projectTitle,
                                  codeLink: submission.codeLink,
                                  liveDemoLink: submission.liveDemoLink
                                }
                              ]).map((project, index) => (
                            <div
                              key={`${submission._id}-project-${index}`}
                              className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 dark:border-white/8 dark:bg-white/5"
                            >
                              <p className="font-medium text-slate-700 dark:text-slate-100">
                                Project {index + 1}: {project.projectName || `Project ${index + 1}`}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-3">
                                {project.codeLink && (
                                  <a
                                    href={project.codeLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary"
                                  >
                                    Code link
                                  </a>
                                )}
                                {project.liveDemoLink && (
                                  <a
                                    href={project.liveDemoLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary"
                                  >
                                    Live demo
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ModalShell
        open={Boolean(activeSubmissionApplication)}
        onClose={() => setActiveSubmissionId(null)}
        title={activeSubmissionApplication ? `Submit projects for ${activeSubmissionApplication.internship?.title || "internship"}` : ""}
        description="Add all 3 project entries together. Each project needs a name and code link. Live demo is optional."
        className="max-w-5xl"
      >
        {activeSubmissionApplication ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <FieldCard label="Student name">
                <Input
                  value={forms[activeSubmissionApplication._id]?.studentName || ""}
                  onChange={(event) =>
                    updateFormField(
                      activeSubmissionApplication._id,
                      "studentName",
                      event.target.value
                    )
                  }
                />
              </FieldCard>
              <FieldCard label="Task name">
                <Input
                  value={forms[activeSubmissionApplication._id]?.taskName || ""}
                  onChange={(event) =>
                    updateFormField(
                      activeSubmissionApplication._id,
                      "taskName",
                      event.target.value
                    )
                  }
                />
              </FieldCard>
              <FieldCard label="Task number">
                <Input
                  value={forms[activeSubmissionApplication._id]?.taskNumber || ""}
                  onChange={(event) =>
                    updateFormField(
                      activeSubmissionApplication._id,
                      "taskNumber",
                      event.target.value
                    )
                  }
                />
              </FieldCard>
            </div>

            {activeSubmissionApplication.internshipMeta?.taskPdfUrl ? (
              <a
                href={activeSubmissionApplication.internshipMeta.taskPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm font-medium text-primary"
              >
                Open assigned task brief
              </a>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-3">
              {(forms[activeSubmissionApplication._id]?.projects || []).map((project, index) => (
                <div
                  key={`${activeSubmissionApplication._id}-editor-project-${index}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/5"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Project {index + 1}
                  </p>
                  <div className="mt-3 space-y-3">
                    <Input
                      placeholder={`Project ${index + 1} name`}
                      value={project.projectName || ""}
                      onChange={(event) =>
                        updateProjectField(
                          activeSubmissionApplication._id,
                          index,
                          "projectName",
                          event.target.value
                        )
                      }
                    />
                    <Input
                      placeholder="GitHub / code link"
                      value={project.codeLink || ""}
                      onChange={(event) =>
                        updateProjectField(
                          activeSubmissionApplication._id,
                          index,
                          "codeLink",
                          event.target.value
                        )
                      }
                    />
                    <Input
                      placeholder="Live demo link (optional)"
                      value={project.liveDemoLink || ""}
                      onChange={(event) =>
                        updateProjectField(
                          activeSubmissionApplication._id,
                          index,
                          "liveDemoLink",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <FieldCard label="Drive / ZIP link">
                <Input
                  placeholder="Optional final files link"
                  value={forms[activeSubmissionApplication._id]?.driveLink || ""}
                  onChange={(event) =>
                    updateFormField(
                      activeSubmissionApplication._id,
                      "driveLink",
                      event.target.value
                    )
                  }
                />
              </FieldCard>
              <FieldCard label="Notes">
                <Textarea
                  rows={4}
                  placeholder="Any project explanation or submission notes"
                  value={forms[activeSubmissionApplication._id]?.notes || ""}
                  onChange={(event) =>
                    updateFormField(
                      activeSubmissionApplication._id,
                      "notes",
                      event.target.value
                    )
                  }
                />
              </FieldCard>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                disabled={busyId === activeSubmissionApplication._id}
                onClick={() => submitProject(activeSubmissionApplication._id)}
              >
                {busyId === activeSubmissionApplication._id ? "Submitting..." : "Submit all projects"}
              </Button>
              <Button variant="outline" onClick={() => setActiveSubmissionId(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}

function FieldCard({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      {children}
    </div>
  );
}
