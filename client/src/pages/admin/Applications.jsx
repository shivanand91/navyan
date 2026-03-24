import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const statusOrder = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested",
  "Completed",
  "Rejected"
];

const WORKFLOW_TABS = [
  { key: "new", label: "New", description: "Fresh applications awaiting the first pass." },
  { key: "review", label: "Review", description: "Needs admin review or revision follow-up." },
  { key: "inprogress", label: "In Progress", description: "Selected candidates in active execution." },
  { key: "completed", label: "Completed", description: "Closed workflows and finished internships." }
];

const TASK_BRIEF_VISIBLE_STATUSES = new Set([
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested",
  "Completed"
]);

const getWorkflowBucket = (application) => {
  if (["Completed", "Rejected"].includes(application.status)) {
    return "completed";
  }

  if (["Selected", "In Progress", "Submission Pending"].includes(application.status)) {
    return "inprogress";
  }

  if (
    ["Submitted", "Revision Requested"].includes(application.status) ||
    application.payment?.status === "Pending"
  ) {
    return "review";
  }

  return "new";
};

const summarizeStatuses = (applications) =>
  applications.reduce((counts, application) => {
    counts[application.status] = (counts[application.status] || 0) + 1;
    return counts;
  }, {});

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [notesById, setNotesById] = useState({});
  const [activeWorkflowKey, setActiveWorkflowKey] = useState("new");

  const load = async () => {
    try {
      const { data } = await api.get("/applications/admin", {
        params: search ? { search } : {}
      });
      setApplications(data.applications || []);
      setGroups(data.groups || []);
      setNotesById(
        Object.fromEntries(
          (data.applications || []).map((app) => [app._id, app.internalNotes || ""])
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePaymentDecision = async (id, paymentDecision) => {
    setUpdatingId(`${id}:payment:${paymentDecision}`);
    try {
      await api.post(`/applications/admin/${id}/action`, {
        paymentDecision,
        internalNotes: notesById[id]
      });
      toast.success(
        paymentDecision === "Verified" ? "Payment marked as verified." : "Payment rejected."
      );
      load();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not review payment."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(`${id}:status:${status}`);
    try {
      const { data } = await api.post(`/applications/admin/${id}/action`, {
        status,
        internalNotes: notesById[id]
      });
      if (Array.isArray(data?.warnings) && data.warnings.length > 0) {
        toast.success(`Status updated to ${status}`);
        toast.warning(data.warnings[0]);
      } else {
        toast.success(`Status updated to ${status}`);
      }
      load();
    } catch (e) {
      console.error(e);
      toast.error(getApiErrorMessage(e, "Could not update status."));
    } finally {
      setUpdatingId(null);
    }
  };

  const groupedApplications = useMemo(() => {
    if (groups.length > 0) {
      return groups;
    }

    const grouped = applications.reduce((accumulator, application) => {
      const categoryLabel =
        application.domainLabel ||
        application.internship?.role ||
        application.internship?.title ||
        "General Internship";
      const categoryKey = categoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      if (!accumulator[categoryKey]) {
        accumulator[categoryKey] = {
          categoryKey,
          categoryLabel,
          applicationCount: 0,
          statusCounts: {},
          applications: []
        };
      }

      accumulator[categoryKey].applications.push(application);
      accumulator[categoryKey].applicationCount += 1;
      accumulator[categoryKey].statusCounts[application.status] =
        (accumulator[categoryKey].statusCounts[application.status] || 0) + 1;

      return accumulator;
    }, {});

    return Object.values(grouped);
  }, [applications, groups]);

  const workflowTabs = useMemo(
    () =>
      WORKFLOW_TABS.map((tab) => ({
        ...tab,
        count: applications.filter((application) => getWorkflowBucket(application) === tab.key).length
      })),
    [applications]
  );

  const visibleGroups = useMemo(
    () =>
      groupedApplications
        .map((group) => {
          const filteredApplications = group.applications.filter(
            (application) => getWorkflowBucket(application) === activeWorkflowKey
          );

          return {
            ...group,
            applications: filteredApplications,
            applicationCount: filteredApplications.length,
            statusCounts: summarizeStatuses(filteredApplications)
          };
        })
        .filter((group) => group.applicationCount > 0),
    [activeWorkflowKey, groupedApplications]
  );

  const renderApplicationCard = (app) => {
    const paymentStatus = app.payment?.status;
    const requiresPaymentReview = paymentStatus && paymentStatus !== "Not Required";
    const paymentCleared = ["Verified", "Linked"].includes(paymentStatus);

    return (
      <div
        key={app._id}
        className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {app.user?.fullName ?? "Candidate"} ·{" "}
              <span className="text-slate-500 dark:text-slate-400">
                {app.internship?.title ?? "Internship"}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {app.user?.email} · Duration: {app.durationKey} · Applied on{" "}
              {new Date(app.createdAt).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Domain: {app.domainLabel || app.internship?.role || app.internship?.title || "General Internship"}
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-[11px]">
              {app.user?.profile?.resumeUrl && (
                <a
                  href={app.user.profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  Resume
                </a>
              )}
              {app.user?.profile?.githubUrl && (
                <a
                  href={app.user.profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  GitHub
                </a>
              )}
              {app.user?.profile?.linkedinUrl && (
                <a
                  href={app.user.profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  LinkedIn
                </a>
              )}
              {app.user?.profile?.portfolioUrl && (
                <a
                  href={app.user.profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  Portfolio
                </a>
              )}
              {TASK_BRIEF_VISIBLE_STATUSES.has(app.status) && app.internshipMeta?.taskPdfUrl && (
                <a
                  href={app.internshipMeta.taskPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  Task brief
                </a>
              )}
            </div>
          </div>
          <StatusBadge status={app.status} />
        </div>

        {app.motivation && (
          <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-slate-600 dark:bg-[#15151e] dark:text-slate-300">
            {app.motivation}
          </p>
        )}

        {requiresPaymentReview ? (
          <div
            className={`mt-3 rounded-2xl border px-3 py-3 text-xs ${
              paymentStatus === "Verified" || paymentStatus === "Linked"
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                : paymentStatus === "Rejected"
                  ? "border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                  : "border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
            }`}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-medium">
                  Payment{" "}
                  {paymentStatus === "Pending"
                    ? "awaiting verification"
                    : paymentStatus.toLowerCase()}{" "}
                  · Rs {app.payment.amount}
                </p>
                <p className="mt-1">
                  UTR: {app.payment.utrNumber} · Ref: {app.payment.paymentReference}
                </p>
              </div>
              {paymentStatus === "Pending" ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    disabled={updatingId === `${app._id}:payment:Verified`}
                    onClick={() => handlePaymentDecision(app._id, "Verified")}
                  >
                    Verify payment
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={updatingId === `${app._id}:payment:Rejected`}
                    onClick={() => handlePaymentDecision(app._id, "Rejected")}
                  >
                    Reject payment
                  </Button>
                </div>
              ) : null}
            </div>
            {!paymentCleared && paymentStatus !== "Rejected" ? (
              <p className="mt-2 text-[11px] opacity-80">
                Workflow actions remain locked until this payment is verified.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          <Input
            placeholder="Internal notes"
            value={notesById[app._id] || ""}
            onChange={(event) =>
              setNotesById((prev) => ({ ...prev, [app._id]: event.target.value }))
            }
          />
          <div className="flex flex-wrap items-center gap-2">
            {activeWorkflowKey === "new" ? (
              <>
                {app.status !== "Completed" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      updatingId === `${app._id}:status:Completed` ||
                      (requiresPaymentReview && !paymentCleared)
                    }
                    onClick={() => handleStatusChange(app._id, "Completed")}
                  >
                    Complete
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="subtle"
                  disabled={
                    updatingId === `${app._id}:status:Selected` ||
                    (requiresPaymentReview && !paymentCleared)
                  }
                  onClick={() => handleStatusChange(app._id, "Selected")}
                >
                  Select
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={updatingId === `${app._id}:status:Rejected`}
                  onClick={() => handleStatusChange(app._id, "Rejected")}
                >
                  Reject
                </Button>
              </>
            ) : null}

            {activeWorkflowKey === "review" ? (
              <>
                {app.status !== "Completed" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      updatingId === `${app._id}:status:Completed` ||
                      (requiresPaymentReview && !paymentCleared)
                    }
                    onClick={() => handleStatusChange(app._id, "Completed")}
                  >
                    Complete
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={updatingId === `${app._id}:status:Rejected`}
                  onClick={() => handleStatusChange(app._id, "Rejected")}
                >
                  Reject
                </Button>
              </>
            ) : null}

            {activeWorkflowKey === "inprogress" ? (
              <>
                {app.status !== "Completed" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      updatingId === `${app._id}:status:Completed` ||
                      (requiresPaymentReview && !paymentCleared)
                    }
                    onClick={() => handleStatusChange(app._id, "Completed")}
                  >
                    Complete
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={updatingId === `${app._id}:status:Rejected`}
                  onClick={() => handleStatusChange(app._id, "Rejected")}
                >
                  Reject
                </Button>
              </>
            ) : null}

            {activeWorkflowKey === "completed" && app.status !== "Completed" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={
                  updatingId === `${app._id}:status:Completed` ||
                  (requiresPaymentReview && !paymentCleared)
                }
                onClick={() => handleStatusChange(app._id, "Completed")}
              >
                Complete
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Applications by workflow
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Review candidates through focused workflow buckets instead of one long mixed queue.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search (name, notes...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-52 text-xs"
          />
          <Button size="sm" variant="outline" onClick={load}>
            Search
          </Button>
        </div>
      </div>

      {groupedApplications.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 dark:text-slate-400">No applications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-full gap-2 rounded-[24px] border border-slate-200 bg-white/70 p-2 dark:border-white/8 dark:bg-white/5">
              {workflowTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveWorkflowKey(tab.key)}
                  className={`rounded-2xl px-4 py-2 text-left transition ${
                    activeWorkflowKey === tab.key
                      ? "bg-[#d4a85f] text-[#111418] shadow-[0_10px_30px_rgba(212,168,95,0.22)]"
                      : "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-[#b7c0cc] dark:hover:bg-white/6"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">
                    {tab.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {tab.count} application
                    {tab.count === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 max-w-[16rem] text-[11px] opacity-75">{tab.description}</p>
                </button>
              ))}
            </div>
          </div>

          {visibleGroups.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">No applications in this bucket</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 dark:text-slate-400">
                  No candidates are currently in the {workflowTabs.find((tab) => tab.key === activeWorkflowKey)?.label?.toLowerCase()} queue.
                </p>
              </CardContent>
            </Card>
          ) : (
            visibleGroups.map((group) => (
              <Card key={group.categoryKey}>
                <CardHeader className="space-y-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Role
                      </p>
                      <CardTitle className="mt-1 text-base">{group.categoryLabel}</CardTitle>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {group.applicationCount} application{group.applicationCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {statusOrder
                        .filter((status) => group.statusCounts?.[status])
                        .map((status) => (
                          <span
                            key={status}
                            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]"
                          >
                            {status}: {group.statusCounts[status]}
                          </span>
                        ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {group.applications.map(renderApplicationCard)}
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
}
