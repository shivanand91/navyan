import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [notesById, setNotesById] = useState({});

  const load = async () => {
    try {
      const { data } = await api.get("/applications/admin", {
        params: search ? { search } : {}
      });
      setApplications(data.applications || []);
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

  const filtered = useMemo(() => applications, [applications]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Applications</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Review candidates, update statuses, and keep track of progress.
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {filtered.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No applications yet.</p>
          ) : (
            filtered.map((app) => {
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
                          Payment {paymentStatus === "Pending" ? "awaiting verification" : paymentStatus.toLowerCase()} · Rs {app.payment.amount}
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
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
