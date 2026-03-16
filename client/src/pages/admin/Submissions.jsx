import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [notesById, setNotesById] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/submissions/admin");
      setSubmissions(data.submissions || []);
      setNotesById(
        Object.fromEntries(
          (data.submissions || []).map((item) => [item._id, item.adminNotes || ""])
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not load submissions.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id, action) => {
    setBusyId(`${id}-${action}`);
    try {
      await api.patch(`/submissions/admin/${id}`, {
        action,
        adminNotes: notesById[id]
      });
      toast.success("Submission review updated.");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Could not update submission review.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Submission Review</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Review code links, ask for revisions, and issue completion certificates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No submissions yet.</p>
          ) : (
            submissions.map((item) => (
              <div
                key={item._id}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.application?.user?.fullName || "Student"} ·{" "}
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.application?.internship?.title || "Internship"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Attempt {item.attemptNumber} · Submitted{" "}
                      {new Date(item.submittedAt).toLocaleDateString()} ·{" "}
                      {item.application?.durationKey}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2 text-xs">
                      <a href={item.codeLink} target="_blank" rel="noreferrer" className="text-primary">
                        Code
                      </a>
                      {item.liveDemoLink && (
                        <a
                          href={item.liveDemoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary"
                        >
                          Live demo
                        </a>
                      )}
                      {item.driveLink && (
                        <a href={item.driveLink} target="_blank" rel="noreferrer" className="text-primary">
                          Drive files
                        </a>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={item.reviewStatus} />
                </div>

                {item.notes && (
                  <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-slate-600 dark:bg-[#15151e] dark:text-slate-300">
                    {item.notes}
                  </p>
                )}

                <div className="mt-4 space-y-3">
                  <Textarea
                    rows={3}
                    value={notesById[item._id] || ""}
                    onChange={(event) =>
                      setNotesById((prev) => ({ ...prev, [item._id]: event.target.value }))
                    }
                    placeholder="Internal review notes"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === `${item._id}-request-revision`}
                      onClick={() => handleAction(item._id, "request-revision")}
                    >
                      Request revision
                    </Button>
                    <Button
                      size="sm"
                      variant="subtle"
                      disabled={busyId === `${item._id}-complete`}
                      onClick={() => handleAction(item._id, "complete")}
                    >
                      Mark completed
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === `${item._id}-reject`}
                      onClick={() => handleAction(item._id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
