import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModalShell } from "@/components/premium/ModalShell";
import { toast } from "sonner";

const WORKFLOW_TABS = [
  { key: "new", label: "New", description: "Fresh applications awaiting first review." },
  { key: "review", label: "Review", description: "Submissions, revisions, or payment review." },
  { key: "inprogress", label: "In Progress", description: "Selected candidates currently working." },
  { key: "completed", label: "Completed", description: "Completed or rejected workflows." }
];

const TASK_BRIEF_VISIBLE_STATUSES = new Set([
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested",
  "Completed"
]);

const OFFER_LETTER_VISIBLE_STATUSES = new Set([
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

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "Not added");

const formatList = (value) => {
  if (Array.isArray(value)) {
    const filtered = value.filter(Boolean);
    return filtered.length > 0 ? filtered.join(", ") : "Not added";
  }

  return value || "Not added";
};

const formatBoolean = (value) => {
  if (typeof value !== "boolean") {
    return "Not added";
  }

  return value ? "Yes" : "No";
};

const getRoleLabel = (application) =>
  application?.domainLabel ||
  application?.internship?.role ||
  application?.internship?.title ||
  "General Internship";

const getRoleKey = (application) => getRoleLabel(application).toLowerCase().replace(/[^a-z0-9]+/g, "-");

const getDurationLabel = (application) =>
  application?.internship?.durations?.find((item) => item.key === application.durationKey)?.label ||
  application?.durationKey ||
  "Not added";

const getApplicantName = (application) =>
  application?.user?.profile?.fullName || application?.user?.fullName || "Candidate";

const getApplicantProfile = (application) => application?.user?.profile || {};

const normalizePhoneLink = (value) => {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  return digits || "";
};

const normalizeWhatsappLink = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};

const getEndDateHint = (value) => {
  if (!value) return "End date not added";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(value);
  endDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) return `Ended ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`;
  if (diffDays === 0) return "Ends today";
  return `${diffDays} day${diffDays === 1 ? "" : "s"} left`;
};

const getExternalLinkProps = (href) =>
  /^https?:\/\//i.test(href || "") ? { target: "_blank", rel: "noreferrer" } : {};

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [reminderId, setReminderId] = useState(null);
  const [notesById, setNotesById] = useState({});
  const [activeWorkflowKey, setActiveWorkflowKey] = useState("new");
  const [activeRoleKey, setActiveRoleKey] = useState("all");
  const [detailApplicationId, setDetailApplicationId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/applications/admin", {
        params: search ? { search } : {}
      });
      const nextApplications = data.applications || [];

      setApplications(nextApplications);
      setNotesById(
        Object.fromEntries(
          nextApplications.map((application) => [
            application._id,
            application.internalNotes || ""
          ])
        )
      );
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not load applications."));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const workflowTabs = useMemo(
    () =>
      WORKFLOW_TABS.map((tab) => ({
        ...tab,
        count: applications.filter((application) => getWorkflowBucket(application) === tab.key).length
      })),
    [applications]
  );

  const workflowApplications = useMemo(
    () => applications.filter((application) => getWorkflowBucket(application) === activeWorkflowKey),
    [activeWorkflowKey, applications]
  );

  const roleOptions = useMemo(() => {
    const roles = workflowApplications.reduce((accumulator, application) => {
      const key = getRoleKey(application);

      if (!accumulator[key]) {
        accumulator[key] = {
          key,
          label: getRoleLabel(application),
          count: 0
        };
      }

      accumulator[key].count += 1;
      return accumulator;
    }, {});

    return Object.values(roles).sort((left, right) => left.label.localeCompare(right.label));
  }, [workflowApplications]);

  useEffect(() => {
    if (activeRoleKey === "all") return;

    const roleStillExists = roleOptions.some((role) => role.key === activeRoleKey);
    if (!roleStillExists) {
      setActiveRoleKey("all");
    }
  }, [activeRoleKey, roleOptions]);

  const visibleApplications = useMemo(
    () =>
      activeRoleKey === "all"
        ? workflowApplications
        : workflowApplications.filter((application) => getRoleKey(application) === activeRoleKey),
    [activeRoleKey, workflowApplications]
  );

  const detailApplication = useMemo(
    () => applications.find((application) => application._id === detailApplicationId) || null,
    [applications, detailApplicationId]
  );

  const handleStatusChange = async (application, status) => {
    const id = application._id;
    setUpdatingId(`${id}:status:${status}`);

    try {
      const { data } = await api.post(`/applications/admin/${id}/action`, {
        status,
        internalNotes: notesById[id]
      });

      toast.success(`Status updated to ${status}`);
      if (Array.isArray(data?.warnings) && data.warnings.length > 0) {
        toast.warning(data.warnings[0]);
      }

      await load();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not update status."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentDecision = async (application, paymentDecision) => {
    const id = application._id;
    setUpdatingId(`${id}:payment:${paymentDecision}`);

    try {
      await api.post(`/applications/admin/${id}/action`, {
        paymentDecision,
        internalNotes: notesById[id]
      });

      toast.success(
        paymentDecision === "Verified" ? "Payment marked as verified." : "Payment rejected."
      );
      await load();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not review payment."));
    } finally {
      setUpdatingId(null);
    }
  };

  const sendReminder = async (application) => {
    setReminderId(application._id);

    try {
      await api.post(`/applications/admin/${application._id}/send-reminder`);
      toast.success("Task submission reminder email sent.");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to send reminder email."));
    } finally {
      setReminderId(null);
    }
  };

  const updateNotes = (applicationId, value) => {
    setNotesById((current) => ({
      ...current,
      [applicationId]: value
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Admin workflow
          </p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Applications
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Filter by workflow, then by role. Cards stay compact; full candidate information opens in a modal.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search name, email, phone, notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") load();
            }}
            className="h-10 w-full text-xs sm:w-72"
          />
          <Button size="sm" variant="outline" onClick={load}>
            Search
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-grid min-w-full grid-cols-4 gap-2 rounded-[24px] border border-slate-200 bg-white/80 p-2 dark:border-white/8 dark:bg-white/5 max-lg:min-w-[760px]">
          {workflowTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveWorkflowKey(tab.key);
                setActiveRoleKey("all");
              }}
              className={`rounded-2xl px-4 py-3 text-left transition ${
                activeWorkflowKey === tab.key
                  ? "bg-[#d4a85f] text-[#111418] shadow-[0_12px_34px_rgba(212,168,95,0.2)]"
                  : "text-slate-600 hover:bg-slate-100 dark:text-[#b7c0cc] dark:hover:bg-white/6"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">
                {tab.label}
              </p>
              <p className="mt-1 text-lg font-semibold">{tab.count}</p>
              <p className="mt-1 text-[11px] opacity-75">{tab.description}</p>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Role filter
              </p>
              <CardTitle className="mt-1 text-base">
                {workflowApplications.length} application{workflowApplications.length === 1 ? "" : "s"} in{" "}
                {WORKFLOW_TABS.find((tab) => tab.key === activeWorkflowKey)?.label}
              </CardTitle>
            </div>
            {activeRoleKey !== "all" ? (
              <Button size="sm" variant="ghost" onClick={() => setActiveRoleKey("all")}>
                Clear role filter
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {roleOptions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Is workflow bucket me abhi koi role/application nahi hai.
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <RoleFilterButton
                active={activeRoleKey === "all"}
                label="All roles"
                count={workflowApplications.length}
                onClick={() => setActiveRoleKey("all")}
              />
              {roleOptions.map((role) => (
                <RoleFilterButton
                  key={role.key}
                  active={activeRoleKey === role.key}
                  label={role.label}
                  count={role.count}
                  onClick={() => setActiveRoleKey(role.key)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {visibleApplications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No applications found for the selected workflow and role.
            </CardContent>
          </Card>
        ) : (
          visibleApplications.map((application) => (
            <ApplicationRow
              key={application._id}
              application={application}
              reminderBusy={reminderId === application._id}
              onReminder={() => sendReminder(application)}
              onDetails={() => setDetailApplicationId(application._id)}
            />
          ))
        )}
      </div>

      <ApplicationDetailModal
        application={detailApplication}
        notes={detailApplication ? notesById[detailApplication._id] || "" : ""}
        updatingId={updatingId}
        reminderBusy={detailApplication ? reminderId === detailApplication._id : false}
        onClose={() => setDetailApplicationId(null)}
        onNotesChange={updateNotes}
        onStatusChange={handleStatusChange}
        onPaymentDecision={handlePaymentDecision}
        onReminder={sendReminder}
      />
    </div>
  );
}

function RoleFilterButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-left text-sm transition ${
        active
          ? "border-[#d4a85f] bg-[#d4a85f]/15 text-slate-950 dark:text-[#f5f7fa]"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/40 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]"
      }`}
    >
      <span className="font-semibold">{label}</span>
      <span className="ml-2 text-xs opacity-70">{count}</span>
    </button>
  );
}

function ApplicationRow({ application, reminderBusy, onReminder, onDetails }) {
  const profile = getApplicantProfile(application);
  const phoneLink = normalizePhoneLink(profile.phone);
  const offerLetterUrl = application.offerLetter?.accessToken
    ? `/documents/offer-letter/${application.offerLetter.accessToken}`
    : application.offerLetter?.url;
  const canShowOfferLetter =
    OFFER_LETTER_VISIBLE_STATUSES.has(application.status) && Boolean(offerLetterUrl);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(220px,1.2fr)_minmax(0,2fr)_auto] xl:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                {getApplicantName(application)}
              </p>
              <StatusBadge status={application.status} />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Applied {formatDate(application.createdAt)} | {getDurationLabel(application)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCell label="Role" value={getRoleLabel(application)} />
            <SummaryCell label="Start date" value={formatDate(application.internshipMeta?.startDate)} />
            <SummaryCell
              label="End date"
              value={formatDate(application.internshipMeta?.endDate)}
              hint={getEndDateHint(application.internshipMeta?.endDate)}
            />
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <a
              href={phoneLink ? `tel:${phoneLink}` : undefined}
              aria-disabled={!phoneLink}
              className={!phoneLink ? "pointer-events-none opacity-50" : ""}
            >
              <Button size="sm" variant="outline" type="button">
                Call
              </Button>
            </a>

            {canShowOfferLetter ? (
              application.offerLetter?.accessToken ? (
                <Link to={offerLetterUrl}>
                  <Button size="sm" variant="outline" type="button">
                    Offer letter
                  </Button>
                </Link>
              ) : (
                <a href={offerLetterUrl} {...getExternalLinkProps(offerLetterUrl)}>
                  <Button size="sm" variant="outline" type="button">
                    Offer letter
                  </Button>
                </a>
              )
            ) : null}

            <Button
              size="sm"
              variant="outline"
              type="button"
              disabled={reminderBusy}
              onClick={onReminder}
            >
              {reminderBusy ? "Sending..." : "Reminder"}
            </Button>

            <Button size="sm" type="button" onClick={onDetails}>
              Details
            </Button>
          </div>
        </div>

        {application.payment?.status === "Pending" ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            Payment verification pending | Amount: Rs {application.payment.amount} | UTR:{" "}
            {application.payment.utrNumber || "Not added"}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SummaryCell({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/8 dark:bg-white/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
        {value || "Not added"}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}

function ApplicationDetailModal({
  application,
  notes,
  updatingId,
  reminderBusy,
  onClose,
  onNotesChange,
  onStatusChange,
  onPaymentDecision,
  onReminder
}) {
  if (!application) return null;

  const profile = getApplicantProfile(application);
  const phoneLink = normalizePhoneLink(profile.phone);
  const whatsappLink = normalizeWhatsappLink(profile.whatsapp);
  const offerLetterUrl = application.offerLetter?.accessToken
    ? `/documents/offer-letter/${application.offerLetter.accessToken}`
    : application.offerLetter?.url;
  const taskBriefUrl = TASK_BRIEF_VISIBLE_STATUSES.has(application.status)
    ? application.internshipMeta?.taskPdfUrl
    : "";
  const certificateUrl = application.certificate?.certificateId
    ? `/documents/certificate/${application.certificate.certificateId}`
    : "";

  return (
    <ModalShell
      open={Boolean(application)}
      onClose={onClose}
      title={getApplicantName(application)}
      description={`${getRoleLabel(application)} | ${application.status} | ${getDurationLabel(application)}`}
      className="max-w-6xl"
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <ModalTile label="Role" value={getRoleLabel(application)} />
          <ModalTile label="Duration" value={getDurationLabel(application)} />
          <ModalTile label="Start date" value={formatDate(application.internshipMeta?.startDate)} />
          <ModalTile label="End date" value={formatDate(application.internshipMeta?.endDate)} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
            <p className="text-sm font-semibold text-[color:var(--text)]">Student profile</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ModalTile label="Email" value={application.user?.email} />
              <ModalTile label="Phone" value={profile.phone} />
              <ModalTile label="WhatsApp" value={profile.whatsapp} />
              <ModalTile label="City / State" value={[profile.city, profile.state].filter(Boolean).join(", ")} />
              <ModalTile label="College" value={profile.college} />
              <ModalTile label="Degree / Course" value={profile.degree} />
              <ModalTile label="Branch" value={profile.branch} />
              <ModalTile label="Current year" value={profile.currentYear} />
              <ModalTile label="Graduation year" value={profile.graduationYear} />
              <ModalTile label="Daily hours" value={profile.dailyHours} />
              <ModalTile label="Laptop" value={formatBoolean(profile.hasLaptop)} />
              <ModalTile label="English level" value={profile.englishLevel} />
              <ModalTile label="Skills" value={formatList(profile.skills)} wide />
              <ModalTile label="Preferred roles" value={formatList(profile.preferredRoles)} wide />
              <ModalTile
                label="Previous experience"
                value={profile.prevInternshipExperience || "Not added"}
                wide
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <p className="text-sm font-semibold text-[color:var(--text)]">Quick actions</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <ModalAction href={application.user?.email ? `mailto:${application.user.email}` : ""}>
                  Email
                </ModalAction>
                <ModalAction href={phoneLink ? `tel:${phoneLink}` : ""}>Call</ModalAction>
                <ModalAction href={whatsappLink}>WhatsApp</ModalAction>
                <ModalAction href={profile.linkedinUrl}>LinkedIn</ModalAction>
                <ModalAction href={profile.githubUrl}>GitHub</ModalAction>
                <ModalAction href={profile.portfolioUrl}>Portfolio</ModalAction>
                <ModalAction href={profile.resumeUrl}>Resume</ModalAction>
                <ModalAction href={taskBriefUrl}>Task brief</ModalAction>
                <ModalAction href={offerLetterUrl}>Offer letter</ModalAction>
                <ModalAction href={certificateUrl}>Certificate</ModalAction>
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <p className="text-sm font-semibold text-[color:var(--text)]">Payment</p>
              <div className="mt-3 space-y-2 text-sm text-[color:var(--text-secondary)]">
                <p>Status: {application.payment?.status || "Not Required"}</p>
                {application.payment?.amount ? <p>Amount: Rs {application.payment.amount}</p> : null}
                {application.payment?.utrNumber ? <p>UTR: {application.payment.utrNumber}</p> : null}
              </div>
              {application.payment?.status === "Pending" ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button
                    size="sm"
                    variant="success"
                    disabled={updatingId === `${application._id}:payment:Verified`}
                    onClick={() => onPaymentDecision(application, "Verified")}
                  >
                    Verify payment
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={updatingId === `${application._id}:payment:Rejected`}
                    onClick={() => onPaymentDecision(application, "Rejected")}
                  >
                    Reject payment
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-sm font-semibold text-[color:var(--text)]">Application details</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ModalTile label="Applied on" value={formatDate(application.createdAt)} />
            <ModalTile label="Status" value={application.status} />
            <ModalTile label="Referral code" value={application.referral?.code} />
            <ModalTile label="Referral owner" value={application.referral?.ownerName} />
            <ModalTile label="Motivation" value={application.motivation || "Not added"} wide />
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              Internal notes
            </p>
            <Textarea
              rows={4}
              value={notes}
              onChange={(event) => onNotesChange(application._id, event.target.value)}
              placeholder="Add private admin notes before changing status..."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="text-sm font-semibold text-[color:var(--text)]">Workflow actions</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              size="sm"
              disabled={
                application.status === "Selected" ||
                updatingId === `${application._id}:status:Selected`
              }
              onClick={() => onStatusChange(application, "Selected")}
            >
              Select
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={
                application.status === "Rejected" ||
                updatingId === `${application._id}:status:Rejected`
              }
              onClick={() => onStatusChange(application, "Rejected")}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="success"
              disabled={
                application.status === "Completed" ||
                updatingId === `${application._id}:status:Completed`
              }
              onClick={() => onStatusChange(application, "Completed")}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={reminderBusy}
              onClick={() => onReminder(application)}
            >
              {reminderBusy ? "Sending..." : "Task reminder"}
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalTile({ label, value, wide = false }) {
  return (
    <div className={`rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-3 ${wide ? "md:col-span-2" : ""}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-[color:var(--text)]">{value || "Not added"}</p>
    </div>
  );
}

function ModalAction({ href, children }) {
  if (!href) {
    return (
      <Button size="sm" variant="outline" disabled>
        {children}
      </Button>
    );
  }

  const isInternalDocument = href.startsWith("/documents/");
  if (isInternalDocument) {
    return (
      <Link to={href}>
        <Button size="sm" variant="outline" className="w-full">
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <a href={href} {...getExternalLinkProps(href)}>
      <Button size="sm" variant="outline" className="w-full">
        {children}
      </Button>
    </a>
  );
}
