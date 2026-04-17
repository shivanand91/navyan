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

const metaTextClass = "text-[11px] text-slate-500 dark:text-slate-400";
const detailCardClass =
  "rounded-2xl border border-slate-200 bg-white/80 px-3 py-3 dark:border-white/8 dark:bg-white/5";

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

const getDurationLabel = (application) =>
  application.internship?.durations?.find((item) => item.key === application.durationKey)?.label ||
  application.durationKey;

const normalizePhoneLink = (value) => {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  return digits || "";
};

const normalizeWhatsappLink = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};

const getApplicantName = (application) =>
  application?.user?.profile?.fullName || application?.user?.fullName || "Candidate";

const getApplicantProfile = (application) => application?.user?.profile || {};

const buildContactActions = (application) => {
  const profile = getApplicantProfile(application);
  const email = application?.user?.email || "";
  const phone = profile.phone || "";
  const whatsapp = profile.whatsapp || "";

  return [
    { href: email ? `mailto:${email}` : "", label: "Email" },
    { href: phone ? `tel:${normalizePhoneLink(phone)}` : "", label: "Call" },
    { href: normalizeWhatsappLink(whatsapp), label: "WhatsApp" },
    { href: profile.resumeUrl, label: "Resume" },
    { href: profile.githubUrl, label: "GitHub" },
    { href: profile.linkedinUrl, label: "LinkedIn" },
    { href: profile.portfolioUrl, label: "Portfolio" },
    {
      href:
        TASK_BRIEF_VISIBLE_STATUSES.has(application?.status) && application?.internshipMeta?.taskPdfUrl
          ? application.internshipMeta.taskPdfUrl
          : "",
      label: "Task brief"
    }
  ].filter((item) => item.href);
};

const getDaysLabel = (value) => {
  if (value === 1) {
    return "1 day";
  }

  return `${value} days`;
};

const getEndDateMeta = (value) => {
  if (!value) {
    return { isUrgent: false, hint: "End date not added" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(value);
  endDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return {
      isUrgent: true,
      hint: `Ended ${getDaysLabel(Math.abs(diffDays))} ago`
    };
  }

  if (diffDays === 0) {
    return {
      isUrgent: true,
      hint: "Ends today"
    };
  }

  if (diffDays <= 5) {
    return {
      isUrgent: true,
      hint: `${getDaysLabel(diffDays)} left`
    };
  }

  return {
    isUrgent: false,
    hint: `${getDaysLabel(diffDays)} left`
  };
};

function DetailTile({ label, value }) {
  return (
    <div className={detailCardClass}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{value || "Not added"}</p>
    </div>
  );
}

function TimelineTile({ label, value, hint, isUrgent = false }) {
  return (
    <div
      className={`${detailCardClass} ${
        isUrgent
          ? "border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10"
          : ""
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
          isUrgent ? "text-rose-500 dark:text-rose-200/80" : "text-slate-400 dark:text-slate-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${
          isUrgent ? "text-rose-700 dark:text-rose-100" : "text-slate-700 dark:text-slate-200"
        }`}
      >
        {value || "Not added"}
      </p>
      {hint ? (
        <p
          className={`mt-1 text-[11px] ${
            isUrgent ? "text-rose-600 dark:text-rose-200" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ActionLink({ href, children }) {
  if (!href) {
    return null;
  }

  const opensInNewTab = /^https?:\/\//i.test(href);

  return (
    <a
      href={href}
      target={opensInNewTab ? "_blank" : undefined}
      rel={opensInNewTab ? "noreferrer" : undefined}
      className="text-primary"
    >
      {children}
    </a>
  );
}

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [notesById, setNotesById] = useState({});
  const [activeWorkflowKey, setActiveWorkflowKey] = useState("new");
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

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

  const visibleApplications = useMemo(
    () => visibleGroups.flatMap((group) => group.applications),
    [visibleGroups]
  );

  useEffect(() => {
    setSelectedApplicationId((current) => {
      if (visibleApplications.length === 0) {
        return null;
      }

      return visibleApplications.some((application) => application._id === current)
        ? current
        : visibleApplications[0]._id;
    });
  }, [visibleApplications]);

  const selectedApplication = useMemo(
    () =>
      visibleApplications.find((application) => application._id === selectedApplicationId) || null,
    [selectedApplicationId, visibleApplications]
  );

  const renderApplicationCard = (app) => {
    const profile = getApplicantProfile(app);
    const fullName = getApplicantName(app);
    const email = app.user?.email || "";
    const startDate = app.internshipMeta?.startDate;
    const endDate = app.internshipMeta?.endDate;
    const contactActions = buildContactActions(app);
    const paymentStatus = app.payment?.status;
    const requiresPaymentReview = paymentStatus && paymentStatus !== "Not Required";
    const paymentCleared = ["Verified", "Linked"].includes(paymentStatus);
    const isInProgressView = activeWorkflowKey === "inprogress";
    const endDateMeta = getEndDateMeta(endDate);

    return (
      <div
        key={app._id}
        className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {fullName} ·{" "}
              <span className="text-slate-500 dark:text-slate-400">
                {app.internship?.title ?? "Internship"}
              </span>
            </p>
            <p className={metaTextClass}>
              {email || "Email not added"} · Duration: {getDurationLabel(app)} · Applied on{" "}
              {new Date(app.createdAt).toLocaleDateString()}
            </p>
            <p className={metaTextClass}>
              Domain: {app.domainLabel || app.internship?.role || app.internship?.title || "General Internship"}
            </p>
            {!isInProgressView && app.referral?.code ? (
              <p className={metaTextClass}>
                Referral: {app.referral.code}
                {app.referral.ownerName ? ` · ${app.referral.ownerName}` : ""}
              </p>
            ) : null}
            {!isInProgressView && contactActions.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-1 text-[11px]">
                {contactActions.map((item) => (
                  <ActionLink key={`${app._id}-${item.label}`} href={item.href}>
                    {item.label}
                  </ActionLink>
                ))}
              </div>
            ) : null}
          </div>
          <StatusBadge status={app.status} />
        </div>

        {isInProgressView ? (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <TimelineTile label="Start date" value={formatDate(startDate)} />
            <TimelineTile
              label="End date"
              value={formatDate(endDate)}
              hint={endDateMeta.hint}
              isUrgent={endDateMeta.isUrgent}
            />
          </div>
        ) : null}

        {!isInProgressView && app.motivation ? (
          <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-slate-600 dark:bg-[#15151e] dark:text-slate-300">
            {app.motivation}
          </p>
        ) : null}

        {!isInProgressView ? (
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            <DetailTile
              label="Phone / WhatsApp"
              value={[profile.phone, profile.whatsapp].filter(Boolean).join(" / ")}
            />
            <DetailTile
              label="Location"
              value={[profile.city, profile.state].filter(Boolean).join(", ")}
            />
            <DetailTile
              label="Education"
              value={[profile.college, profile.degree, profile.branch].filter(Boolean).join(" · ")}
            />
            <DetailTile
              label="Academic year"
              value={[profile.currentYear, profile.graduationYear && `Grad ${profile.graduationYear}`]
                .filter(Boolean)
                .join(" · ")}
            />
            <DetailTile label="Skills" value={formatList(profile.skills)} />
            <DetailTile label="Preferred roles" value={formatList(profile.preferredRoles)} />
            <DetailTile
              label="Work setup"
              value={[
                profile.dailyHours ? `${profile.dailyHours} hrs/day` : "",
                `Laptop: ${formatBoolean(profile.hasLaptop)}`,
                profile.englishLevel || ""
              ]
                .filter(Boolean)
                .join(" · ")}
            />
            <DetailTile label="Experience" value={profile.prevInternshipExperience} />
          </div>
        ) : null}

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
            placeholder="Search name, email, phone, notes..."
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

          <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
            <Card className="xl:sticky xl:top-5 xl:self-start">
              <CardHeader className="space-y-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Applicant menu
                  </p>
                  <CardTitle className="mt-1 text-base">
                    {visibleApplications.length} applicant{visibleApplications.length === 1 ? "" : "s"}
                  </CardTitle>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {workflowTabs.find((tab) => tab.key === activeWorkflowKey)?.label} queue ke applicants.
                </p>
              </CardHeader>
              <CardContent className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                {visibleApplications.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Is workflow bucket me abhi koi applicant nahi hai.
                  </p>
                ) : (
                  visibleApplications.map((application) => {
                    const isSelected = application._id === selectedApplicationId;
                    return (
                      <div
                        key={`menu-${application._id}`}
                        className={`rounded-2xl border px-3 py-3 ${
                          isSelected
                            ? "border-primary/25 bg-primary/10"
                            : "border-slate-200 bg-slate-50/70 dark:border-white/8 dark:bg-white/5"
                        }`}
                      >
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {getApplicantName(application)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {application.internship?.title || "Internship"}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <StatusBadge status={application.status} />
                          <Button
                            size="sm"
                            variant={isSelected ? "subtle" : "outline"}
                            onClick={() => setSelectedApplicationId(application._id)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <div className="space-y-5">
              {selectedApplication ? (
                <Card>
                  <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Applicant details
                        </p>
                        <CardTitle className="mt-1 text-base">
                          {getApplicantName(selectedApplication)}
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {selectedApplication.internship?.title || "Internship"} ·{" "}
                          {getDurationLabel(selectedApplication)} · {selectedApplication.status}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px]">
                        {buildContactActions(selectedApplication).map((item) => (
                          <ActionLink
                            key={`detail-${selectedApplication._id}-${item.label}`}
                            href={item.href}
                          >
                            {item.label}
                          </ActionLink>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                      <DetailTile label="Email" value={selectedApplication.user?.email} />
                      <DetailTile
                        label="Phone / WhatsApp"
                        value={[
                          getApplicantProfile(selectedApplication).phone,
                          getApplicantProfile(selectedApplication).whatsapp
                        ]
                          .filter(Boolean)
                          .join(" / ")}
                      />
                      <DetailTile
                        label="Location"
                        value={[
                          getApplicantProfile(selectedApplication).city,
                          getApplicantProfile(selectedApplication).state
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      />
                      <DetailTile
                        label="Applied on"
                        value={formatDate(selectedApplication.createdAt)}
                      />
                      <TimelineTile
                        label="Start date"
                        value={formatDate(selectedApplication.internshipMeta?.startDate)}
                      />
                      <TimelineTile
                        label="End date"
                        value={formatDate(selectedApplication.internshipMeta?.endDate)}
                        hint={getEndDateMeta(selectedApplication.internshipMeta?.endDate).hint}
                        isUrgent={getEndDateMeta(selectedApplication.internshipMeta?.endDate).isUrgent}
                      />
                      <DetailTile
                        label="Education"
                        value={[
                          getApplicantProfile(selectedApplication).college,
                          getApplicantProfile(selectedApplication).degree,
                          getApplicantProfile(selectedApplication).branch
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                      <DetailTile
                        label="Academic year"
                        value={[
                          getApplicantProfile(selectedApplication).currentYear,
                          getApplicantProfile(selectedApplication).graduationYear &&
                            `Grad ${getApplicantProfile(selectedApplication).graduationYear}`
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                      <DetailTile
                        label="Skills"
                        value={formatList(getApplicantProfile(selectedApplication).skills)}
                      />
                      <DetailTile
                        label="Preferred roles"
                        value={formatList(getApplicantProfile(selectedApplication).preferredRoles)}
                      />
                      <DetailTile
                        label="Work setup"
                        value={[
                          getApplicantProfile(selectedApplication).dailyHours
                            ? `${getApplicantProfile(selectedApplication).dailyHours} hrs/day`
                            : "",
                          `Laptop: ${formatBoolean(getApplicantProfile(selectedApplication).hasLaptop)}`,
                          getApplicantProfile(selectedApplication).englishLevel || ""
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                      <DetailTile
                        label="Experience"
                        value={getApplicantProfile(selectedApplication).prevInternshipExperience}
                      />
                    </div>

                    {selectedApplication.motivation ? (
                      <div className="rounded-2xl bg-slate-50/80 px-4 py-4 dark:bg-[#15151e]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Motivation
                        </p>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                          {selectedApplication.motivation}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
