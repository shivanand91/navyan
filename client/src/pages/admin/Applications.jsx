import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
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

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [notesById, setNotesById] = useState({});

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
      await api.patch(`/applications/admin/${id}`, {
        paymentDecision,
        internalNotes: notesById[id]
      });
      toast.success(
        paymentDecision === "Verified" ? "Payment marked as verified." : "Payment rejected."
      );
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not review payment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(`${id}:status:${status}`);
    try {
      await api.patch(`/applications/admin/${id}`, {
        status,
        internalNotes: notesById[id]
      });
      toast.success(`Status updated to ${status}`);
      load();
    } catch (e) {
      console.error(e);
      toast.error("Could not update status.");
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
        application.internship?.role || application.internship?.title || "Uncategorized";
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
            <Button
              size="sm"
              variant="ghost"
              disabled={
                updatingId === `${app._id}:status:Shortlisted` ||
                (requiresPaymentReview && !paymentCleared)
              }
              onClick={() => handleStatusChange(app._id, "Shortlisted")}
            >
              Shortlist
            </Button>
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
            Applications by category
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Review candidates in grouped category sections instead of one mixed list.
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
        groupedApplications.map((group) => (
          <Card key={group.categoryKey}>
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Category
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
    </div>
  );
}
