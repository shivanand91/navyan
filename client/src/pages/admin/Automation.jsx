import { useState, useEffect } from "react";
import {
  Clock,
  UserCheck,
  AlertTriangle,
  FileClock,
  Sparkles,
  Play,
  RotateCcw,
  Pause,
  Mail,
  UserMinus,
  Settings2,
  CheckCircle,
  AlertCircle,
  BellRing
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModalShell } from "@/components/premium/ModalShell";
import { toast } from "sonner";

export default function Automation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggeringCron, setTriggeringCron] = useState(false);

  // Extension Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [extensionDays, setExtensionDays] = useState("7");
  const [extensionReason, setExtensionReason] = useState("");
  const [submittingExtension, setSubmittingExtension] = useState(false);

  // Override State
  const [overridingApp, setOverridingApp] = useState(null);
  const [overrideAction, setOverrideAction] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [submittingOverride, setSubmittingOverride] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/automation/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load automation metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTriggerCron = async () => {
    try {
      setTriggeringCron(true);
      // We pass the dev/mock secret which matches the backend default
      const res = await api.get("/automation/cron?secret=dev_cron_secret");
      toast.success(`Cron finished: processed ${res.data.result?.processed ?? 0} events.`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to execute cron.");
    } finally {
      setTriggeringCron(false);
    }
  };

  const handleGrantExtension = async () => {
    if (!selectedApp) return;
    try {
      setSubmittingExtension(true);
      await api.post("/automation/extend", {
        applicationId: selectedApp._id,
        extensionDays,
        reason: extensionReason
      });
      toast.success("Deadline extension granted successfully.");
      setSelectedApp(null);
      setExtensionReason("");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to grant extension.");
    } finally {
      setSubmittingExtension(false);
    }
  };

  const handleExecuteOverride = async () => {
    if (!overridingApp || !overrideAction) return;
    try {
      setSubmittingOverride(true);
      await api.post("/automation/override", {
        applicationId: overridingApp._id,
        action: overrideAction,
        reason: overrideReason
      });
      toast.success(`Action '${overrideAction}' executed successfully.`);
      setOverridingApp(null);
      setOverrideAction("");
      setOverrideReason("");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Override execution failed.");
    } finally {
      setSubmittingOverride(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center space-y-2">
          <Clock className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-[color:var(--text-secondary)]">Loading control panel...</p>
        </div>
      </div>
    );
  }

  const { summary, overdueList, autoRejectionList, upcomingEvents, recentLogs } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              Navyan Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[color:var(--text)]">Automation Center</h1>
          <p className="text-xs text-[color:var(--text-secondary)]">
            Manage student progression tracking, push tokens, and automated rejection systems.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={fetchDashboardData}
            variant="outline"
            className="text-xs"
          >
            Refresh Data
          </Button>
          <Button
            size="sm"
            onClick={handleTriggerCron}
            disabled={triggeringCron}
            className="bg-primary text-primary-foreground text-xs"
          >
            {triggeringCron ? "Running Cron..." : "Trigger Cron Now"}
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
          <CardContent className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-semibold text-[color:var(--text-muted)] tracking-wider">
              7 Days Rem.
            </p>
            <p className="text-2xl font-bold text-[color:var(--text)]">{summary?.remaining7}</p>
          </CardContent>
        </Card>
        <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
          <CardContent className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-semibold text-[color:var(--text-muted)] tracking-wider">
              3 Days Rem.
            </p>
            <p className="text-2xl font-bold text-amber-500">{summary?.remaining3}</p>
          </CardContent>
        </Card>
        <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
          <CardContent className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-semibold text-[color:var(--text-muted)] tracking-wider">
              2 Days Rem.
            </p>
            <p className="text-2xl font-bold text-orange-500">{summary?.remaining2}</p>
          </CardContent>
        </Card>
        <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
          <CardContent className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-semibold text-[color:var(--text-muted)] tracking-wider">
              Ending Today
            </p>
            <p className="text-2xl font-bold text-rose-500">{summary?.remainingToday}</p>
          </CardContent>
        </Card>
        <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
          <CardContent className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-semibold text-[color:var(--text-muted)] tracking-wider">
              Overdue
            </p>
            <p className="text-2xl font-bold text-rose-600">{summary?.overdueCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
          <CardContent className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-semibold text-[color:var(--text-muted)] tracking-wider">
              Auto-Reject
            </p>
            <p className="text-2xl font-bold text-red-600">{summary?.autoRejectionEligible}</p>
          </CardContent>
        </Card>
      </div>

      {/* Push Subscribers Section */}
      <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" />
            Push Notification Opt-In Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
          <div className="p-3 bg-[color:var(--card-elevated)] rounded-xl text-center">
            <p className="text-[10px] text-[color:var(--text-muted)] uppercase">Total Students</p>
            <p className="text-xl font-bold mt-1">{summary?.totalUsers}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl text-center">
            <p className="text-[10px] uppercase font-semibold">Subscribed Users</p>
            <p className="text-xl font-bold mt-1">{summary?.pushEnabled}</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-xl text-center">
            <p className="text-[10px] uppercase font-semibold">Declined</p>
            <p className="text-xl font-bold mt-1">{summary?.pushDisabled}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl text-center">
            <p className="text-[10px] uppercase font-semibold">Never Prompted</p>
            <p className="text-xl font-bold mt-1">{summary?.neverAsked}</p>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Submissions and Rejections Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Overdue Submissions */}
        <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
              Overdue Project Submissions ({overdueList?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto divide-y divide-[color:var(--border)]">
              {overdueList?.length === 0 ? (
                <div className="p-6 text-center text-xs text-[color:var(--text-muted)]">
                  No overdue submissions right now.
                </div>
              ) : (
                overdueList?.map((app) => (
                  <div key={app._id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-[color:var(--text)]">
                        {app.user?.fullName} ({app.user?.email})
                      </p>
                      <p className="text-[10px] text-[color:var(--text-secondary)] mt-1">
                        Internship: <strong className="text-primary">{app.internship?.title}</strong> ({app.durationKey})
                      </p>
                      <p className="text-[10px] text-rose-500 mt-0.5">
                        Deadline: {app.internshipMeta?.endDate ? new Date(app.internshipMeta.endDate).toLocaleDateString() : "TBD"}
                        {app.extension?.granted && " (Extended)"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedApp(app)}
                        className="h-8 text-[10px]"
                      >
                        Grant Extension
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setOverridingApp(app)}
                        className="h-8 text-[10px] text-primary"
                      >
                        Actions
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auto-rejection Eligible */}
        <Card className="bg-[color:var(--card)] border-[color:var(--border)]">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserMinus className="h-4.5 w-4.5 text-red-600" />
              Auto-Rejection Candidates (+10 Days Past Due)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto divide-y divide-[color:var(--border)]">
              {autoRejectionList?.length === 0 ? (
                <div className="p-6 text-center text-xs text-[color:var(--text-muted)]">
                  No students in auto-rejection risk range.
                </div>
              ) : (
                autoRejectionList?.map((app) => (
                  <div key={app._id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-[color:var(--text)]">
                        {app.user?.fullName}
                      </p>
                      <p className="text-[10px] text-[color:var(--text-secondary)] mt-1">
                        Deadline expired on: {new Date(app.internshipMeta?.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">
                        Will be automatically rejected on next Cron.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        onClick={() => setSelectedApp(app)}
                        className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Save (Extend)
                      </Button>
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => {
                          setOverridingApp(app);
                          setOverrideAction("reject");
                        }}
                        className="h-8 text-[10px]"
                      >
                        Force Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events queue and Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <Card className="bg-[color:var(--card)] border-[color:var(--border)] xl:col-span-1">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileClock className="h-4.5 w-4.5 text-primary" />
              Upcoming Event Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto divide-y divide-[color:var(--border)]">
              {upcomingEvents?.length === 0 ? (
                <div className="p-6 text-center text-xs text-[color:var(--text-muted)]">
                  Queue is empty.
                </div>
              ) : (
                upcomingEvents?.map((event) => (
                  <div key={event._id} className="p-3 text-[11px] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[color:var(--text)]">{event.application?.user?.fullName}</span>
                      <span className="text-primary uppercase tracking-wide text-[9px] bg-primary/10 px-2 py-0.5 rounded-full">
                        {event.eventType}
                      </span>
                    </div>
                    <p className="text-[10px] text-[color:var(--text-secondary)]">
                      Scheduled: {new Date(event.scheduledFor).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit Logs */}
        <Card className="bg-[color:var(--card)] border-[color:var(--border)] xl:col-span-2">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
              Recent Automation Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto divide-y divide-[color:var(--border)]">
              {recentLogs?.length === 0 ? (
                <div className="p-6 text-center text-xs text-[color:var(--text-muted)]">
                  No recent execution logs.
                </div>
              ) : (
                recentLogs?.map((log) => (
                  <div key={log._id} className="p-3 text-[11px] flex justify-between gap-4 items-start">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[color:var(--text)]">
                        {log.user?.fullName || "System/Cron"}
                      </p>
                      <p className="text-[10px] text-[color:var(--text-secondary)]">
                        {log.message}
                      </p>
                      {log.error && (
                        <p className="text-[10px] text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg mt-1 font-mono">
                          Error: {log.error}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === "Completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                      }`}>
                        {log.status}
                      </span>
                      <p className="text-[9px] text-[color:var(--text-muted)] mt-1">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grant Extension Modal */}
      <ModalShell
        open={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={`Grant Deadline Extension`}
        description={selectedApp ? `Extend the internship end date for ${selectedApp.user?.fullName}.` : ""}
        className="max-w-md"
      >
        {selectedApp && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                Days to Extend
              </label>
              <Input
                type="number"
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
                placeholder="e.g. 7"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                Extension Reason
              </label>
              <Textarea
                rows={3}
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                placeholder="Reason for granting extension (shown to student)"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApp(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleGrantExtension}
                disabled={submittingExtension}
                className="bg-primary text-primary-foreground"
              >
                {submittingExtension ? "Saving..." : "Grant Extension"}
              </Button>
            </div>
          </div>
        )}
      </ModalShell>

      {/* Override Actions Modal */}
      <ModalShell
        open={Boolean(overridingApp)}
        onClose={() => setOverridingApp(null)}
        title="Manual Automation Override"
        description={overridingApp ? `Select an action override for ${overridingApp.user?.fullName}.` : ""}
        className="max-w-md"
      >
        {overridingApp && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                Select Action
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideAction("remind-now")}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all ${
                    overrideAction === "remind-now" ? "border-primary bg-primary/10 text-primary" : "border-[color:var(--border)] hover:bg-[color:var(--card-elevated)]"
                  }`}
                >
                  <Mail className="h-4.5 w-4.5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold">Send Immediate Reminder</p>
                    <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">Triggers one-off push alert and email reminder.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideAction("pause")}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all ${
                    overrideAction === "pause" ? "border-primary bg-primary/10 text-primary" : "border-[color:var(--border)] hover:bg-[color:var(--card-elevated)]"
                  }`}
                >
                  <Pause className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-semibold">Pause Scheduled Reminders</p>
                    <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">Deletes all pending timer actions for this student.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideAction("resume")}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all ${
                    overrideAction === "resume" ? "border-primary bg-primary/10 text-primary" : "border-[color:var(--border)] hover:bg-[color:var(--card-elevated)]"
                  }`}
                >
                  <RotateCcw className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-semibold">Resume Reminders</p>
                    <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">Recalculates dates and reschedules reminder timers.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideAction("reject")}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all ${
                    overrideAction === "reject" ? "border-primary bg-primary/10 text-primary" : "border-[color:var(--border)] hover:bg-[color:var(--card-elevated)]"
                  }`}
                >
                  <UserMinus className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                  <div>
                    <p className="font-semibold">Force Reject / Close</p>
                    <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">Forcefully reject application and clear schedules.</p>
                  </div>
                </button>
              </div>
            </div>

            {overrideAction === "reject" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)] text-rose-500">
                  Rejection Reason (Required)
                </label>
                <Textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Expired deadline, non-responsive student"
                  required
                />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOverridingApp(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteOverride}
                disabled={submittingOverride || !overrideAction || (overrideAction === "reject" && !overrideReason.trim())}
                className="bg-primary text-primary-foreground"
              >
                {submittingOverride ? "Running..." : "Execute Override"}
              </Button>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
}
