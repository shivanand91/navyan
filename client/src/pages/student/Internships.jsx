import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  CircleDollarSign,
  Compass,
  CreditCard,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModalShell } from "@/components/premium/ModalShell";
import { InternshipPreviewPanel } from "@/components/internships/InternshipPreviewPanel";
import { toast } from "sonner";

const durationFallbackLabels = {
  "4-weeks": "4 weeks",
  "3-months": "3 months",
  "6-months": "6 months"
};
const blockingStatuses = new Set([
  "Applied",
  "Under Review",
  "Shortlisted",
  "Selected",
  "In Progress",
  "Submission Pending",
  "Submitted",
  "Revision Requested"
]);

const getDurationLabel = (duration) => duration?.label || durationFallbackLabels[duration?.key] || duration?.key;

const getPriceLabel = (duration) => {
  if (!duration) return "Flexible";
  if (duration.isPaid || duration.price > 0) {
    return duration.price ? `Rs ${duration.price}` : "Paid";
  }
  return "Free";
};

const normalizeUtr = (value) => String(value || "").replace(/\D/g, "").slice(0, 12);
const isValidUpiUtr = (value) => /^\d{12}$/.test(normalizeUtr(value));

export default function StudentInternships() {
  const [internships, setInternships] = useState([]);
  const [blockingApplication, setBlockingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [forms, setForms] = useState({});
  const [paymentSessions, setPaymentSessions] = useState({});
  const [selectedDurations, setSelectedDurations] = useState({});
  const [activeInternship, setActiveInternship] = useState(null);
  const [ticker, setTicker] = useState(Date.now());
  const [searchParams] = useSearchParams();
  const applyId = searchParams.get("apply");

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: internshipData }, { data: applicationData }] = await Promise.all([
          api.get("/internships"),
          api.get("/applications/me")
        ]);
        setInternships(internshipData.internships || []);
        setBlockingApplication(
          (applicationData.applications || []).find((application) =>
            blockingStatuses.has(application.status)
          ) || null
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!applyId || internships.length === 0) return;
    const matchedInternship = internships.find((item) => item._id === applyId);
    if (!matchedInternship) return;
    openInternshipModal(matchedInternship);
  }, [applyId, internships]);

  useEffect(() => {
    if (!activeInternship) return undefined;
    const intervalId = window.setInterval(() => {
      setTicker(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeInternship]);

  const summary = useMemo(
    () => ({
      total: internships.length,
      paidTracks: internships.filter((internship) =>
        (internship.durations || []).some((duration) => duration.isPaid || duration.price > 0)
      ).length,
      remoteTracks: internships.filter((internship) => internship.mode === "remote").length
    }),
    [internships]
  );
  const applicationsLocked = Boolean(blockingApplication);

  const keyFor = (internshipId, durationKey) => `${internshipId}:${durationKey}`;

  const openInternshipModal = (internship) => {
    setActiveInternship(internship);
    setSelectedDurations((prev) => ({
      ...prev,
      [internship._id]: prev[internship._id] || internship.durations?.[0]?.key
    }));
  };

  const updateForm = (key, field, value) => {
    setForms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const generatePaymentQr = async (internshipId, durationKey) => {
    if (applicationsLocked) {
      toast.error(
        `You already have an active application for ${
          blockingApplication?.internship?.title || "another internship"
        }. You can apply again only after that internship is completed or closed.`
      );
      return;
    }

    const key = keyFor(internshipId, durationKey);
    setPaymentLoadingId(key);
    try {
      const { data } = await api.post("/applications/payment-intent", {
        internshipId,
        durationKey
      });
      setPaymentSessions((prev) => ({ ...prev, [key]: data }));
      toast.success("New UPI QR generated. Pay first, then enter the UTR.");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not generate payment QR.");
    } finally {
      setPaymentLoadingId(null);
    }
  };

  const onApply = async (internshipId, durationKey, isPaid) => {
    const key = keyFor(internshipId, durationKey);
    const values = forms[key] || {};

    if (applicationsLocked) {
      toast.error(
        `You can apply to only one internship at a time. Complete ${
          blockingApplication?.internship?.title || "your current internship"
        } first, then apply to the next one.`
      );
      return;
    }

    setSubmittingId(key);
    try {
      const payload = {
        internshipId,
        durationKey,
        motivation: values.motivation
      };

      if (values.referralCode?.trim()) {
        payload.referralCode = values.referralCode.trim().toUpperCase();
      }

      if (isPaid) {
        const paymentSession = paymentSessions[key];
        const waitSeconds = getRemainingWaitSeconds(paymentSession);

        if (!paymentSession?.paymentAttemptId) {
          toast.error("Generate a payment QR before submitting a paid application.");
          return;
        }

        if (waitSeconds > 0) {
          toast.error(`Wait ${waitSeconds}s after payment before entering the UTR.`);
          return;
        }

        if (!isValidUpiUtr(values.utrNumber)) {
          toast.error("Enter the 12-digit UPI reference number shown in your payment app.");
          return;
        }

        payload.paymentAttemptId = paymentSession.paymentAttemptId;
        payload.utrNumber = normalizeUtr(values.utrNumber);
      }

      const { data } = await api.post("/applications", payload);
      toast.success(
        isPaid
          ? "Application submitted. Payment verification is now pending admin review."
          : "Application submitted successfully."
      );
      setBlockingApplication({
        ...(data.application || {}),
        internship: {
          _id: activeInternship?._id,
          title: activeInternship?.title
        },
        status: data.application?.status || "Under Review"
      });
      setForms((prev) => ({ ...prev, [key]: {} }));
      setPaymentSessions((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setActiveInternship(null);
    } catch (error) {
      console.error(error);
      const activeWorkflowTitle = error?.response?.data?.activeWorkflow?.internshipTitle;
      toast.error(
        error?.response?.data?.message ||
        (activeWorkflowTitle
          ? `You already have an active workflow for ${activeWorkflowTitle}.`
          : null) ||
          "Could not submit application. Make sure your profile is complete and you haven’t already applied."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const currentDuration = activeInternship
    ? activeInternship.durations?.find(
        (duration) => duration.key === selectedDurations[activeInternship._id]
      ) || activeInternship.durations?.[0]
    : null;

  const currentKey =
    activeInternship && currentDuration
      ? keyFor(activeInternship._id, currentDuration.key)
      : null;

  const currentPaymentSession = currentKey ? paymentSessions[currentKey] : null;
  const remainingWaitSeconds = getRemainingWaitSeconds(currentPaymentSession);

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Open internships
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Browse the live list in a cleaner workspace. Open any internship to inspect the role,
            pick a duration, and submit a guided application from a single modal.
          </p>
        </div>

        {applicationsLocked ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            You already have an active internship workflow for{" "}
            <span className="font-semibold">
              {blockingApplication?.internship?.title || "your current internship"}
            </span>{" "}
            with status <span className="font-semibold">{blockingApplication?.status}</span>. You
            can apply to a new internship only after this one is completed or closed.
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="navyan-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                  Live roles
                </p>
                <p className="mt-1 font-display text-3xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  {summary.total}
                </p>
              </div>
            </div>
          </div>

          <div className="navyan-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
                <CircleDollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                  Paid tracks
                </p>
                <p className="mt-1 font-display text-3xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  {summary.paidTracks}
                </p>
              </div>
            </div>
          </div>

          <div className="navyan-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                  Remote friendly
                </p>
                <p className="mt-1 font-display text-3xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  {summary.remoteTracks}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="navyan-card overflow-hidden p-0">
          <div className="border-b border-black/8 px-5 py-4 dark:border-white/8 md:px-6">
            <p className="font-display text-lg font-semibold text-slate-950 dark:text-[#f5f7fa]">
              Internship list
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#b7c0cc]">
              All open internships are shown as a clean list. Open any item for the full
              application workflow.
            </p>
          </div>

          <div className="divide-y divide-black/8 dark:divide-white/8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[152px] animate-pulse bg-black/[0.03] dark:bg-white/[0.03]"
                />
              ))
            ) : internships.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-display text-2xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  No open internships right now.
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-[#b7c0cc]">
                  Check back soon for the next cohort.
                </p>
              </div>
            ) : (
              internships.map((internship) => (
                <div
                  key={internship._id}
                  className={`grid gap-4 px-5 py-5 transition md:px-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center ${
                    applyId === internship._id ? "bg-primary/6" : "hover:bg-black/[0.025] dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        {internship.mode?.toUpperCase() || "REMOTE"}
                      </span>
                      <span className="rounded-full border border-black/8 bg-black/[0.03] px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]">
                        {internship.role || "Internship track"}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-[#f5f7fa]">
                        {internship.title}
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                        {internship.shortDescription}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(internship.skillsRequired || []).slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-black/8 bg-black/[0.03] px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(internship.durations || []).map((duration) => (
                        <span
                          key={duration.key}
                          className="rounded-full border border-black/8 bg-black/[0.03] px-3 py-1 text-[11px] font-medium text-slate-700 dark:border-white/8 dark:bg-[#101419]/94 dark:text-[#dce2e9]"
                        >
                          {getDurationLabel(duration)} • {getPriceLabel(duration)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <Button onClick={() => openInternshipModal(internship)}>
                      Open workflow
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="max-w-[220px] text-xs text-slate-500 dark:text-[#7e8794] lg:text-right">
                      Preview the internship, choose a duration, and submit from the modal.
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ModalShell
        open={Boolean(activeInternship)}
        onClose={() => setActiveInternship(null)}
        title={activeInternship?.title}
        description="Inspect the internship and complete the application workflow from one focused surface."
        contentClassName="space-y-0"
      >
        <InternshipPreviewPanel
          internship={activeInternship}
          aside={
            activeInternship && currentDuration ? (
              <div className="space-y-4">
                <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Application workflow
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#b7c0cc]">
                    Select a duration first. Paid tracks require UPI payment and manual payment
                    verification before the application can move forward.
                  </p>

                  {applicationsLocked ? (
                    <div className="mt-4 rounded-[20px] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs leading-6 text-amber-100">
                      New applications are locked while your current internship workflow is active.
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-2">
                    {(activeInternship.durations || []).map((duration) => (
                      <button
                        key={duration.key}
                        type="button"
                        onClick={() =>
                          setSelectedDurations((prev) => ({
                            ...prev,
                            [activeInternship._id]: duration.key
                          }))
                        }
                        className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${
                          currentDuration.key === duration.key
                            ? "border-primary/25 bg-primary/10"
                            : "border-white/8 bg-[#0f1318] hover:border-primary/15 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#f5f7fa]">
                              {getDurationLabel(duration)}
                            </p>
                            <p className="mt-1 text-xs text-[#b7c0cc]">
                              {duration.isPaid || duration.price > 0
                                ? `Paid cohort${duration.price ? ` • Rs ${duration.price}` : ""}`
                                : "Free track"}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#dce2e9]">
                            {currentDuration.key === duration.key ? "Selected" : "Choose"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7e8794]">
                    Why this role
                  </p>
                  <Textarea
                    rows={4}
                    className="mt-4"
                    placeholder="Write a short, focused motivation for why you want this internship."
                    value={forms[currentKey]?.motivation || ""}
                    onChange={(event) => updateForm(currentKey, "motivation", event.target.value)}
                  />
                </div>

                <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7e8794]">
                    Referral code
                  </p>
                  <Input
                    className="mt-4"
                    placeholder="Optional referral code"
                    value={forms[currentKey]?.referralCode || ""}
                    onChange={(event) =>
                      updateForm(
                        currentKey,
                        "referralCode",
                        event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16)
                      )
                    }
                  />
                  <p className="mt-3 text-xs leading-6 text-[#b7c0cc]">
                    If someone shared a Navyan referral code with you, enter it here before applying.
                  </p>
                </div>

                {currentDuration.isPaid || currentDuration.price > 0 ? (
                  <div className="rounded-[28px] border border-primary/18 bg-primary/10 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/18 bg-[#0f1318] text-primary">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#f5f7fa]">
                          Paid application for {getDurationLabel(currentDuration)}
                        </p>
                        <p className="mt-1 text-xs leading-6 text-[#b7c0cc]">
                          UPI payment is required. Only a 12-digit UPI reference number is
                          accepted, and every paid application moves into admin verification before
                          review.
                        </p>
                      </div>
                    </div>

                    {!currentPaymentSession ? (
                      <div className="mt-5 space-y-3">
                        <div className="rounded-[22px] border border-white/8 bg-[#0f1318] p-4">
                          <p className="text-sm font-semibold text-[#f5f7fa]">
                            Amount to pay: {getPriceLabel(currentDuration)}
                          </p>
                          <p className="mt-1 text-xs text-[#b7c0cc]">
                            Generate a fresh QR code, complete payment from your UPI app, then
                            enter the UTR number here.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={paymentLoadingId === currentKey || applicationsLocked}
                          onClick={() => generatePaymentQr(activeInternship._id, currentDuration.key)}
                        >
                          {paymentLoadingId === currentKey ? "Generating QR..." : "Generate payment QR"}
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-[24px] border border-white/8 bg-[#0f1318] p-4">
                          <div className="flex flex-col items-center gap-4">
                            <img
                              src={currentPaymentSession.qrCodeDataUrl}
                              alt="UPI payment QR"
                              className="h-52 w-52 rounded-[24px] border border-slate-200 bg-white p-3"
                            />
                            <div className="space-y-1 text-center">
                              <p className="text-sm font-semibold text-[#f5f7fa]">
                                Pay Rs {currentPaymentSession.amount}
                              </p>
                              <p className="text-[11px] text-[#b7c0cc]">
                                Payment reference: {currentPaymentSession.paymentReference}
                              </p>
                              <p className="text-[11px] text-[#b7c0cc]">
                                UTR accepted after {currentPaymentSession.minimumConfirmationSeconds}s from QR generation.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[22px] border border-white/8 bg-[#0f1318] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8794]">
                            UPI reference number
                          </p>
                          <Input
                            className="mt-3"
                            placeholder="Enter 12-digit UTR"
                            value={forms[currentKey]?.utrNumber || ""}
                            onChange={(event) =>
                              updateForm(
                                currentKey,
                                "utrNumber",
                                normalizeUtr(event.target.value)
                              )
                            }
                          />
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                isValidUpiUtr(forms[currentKey]?.utrNumber)
                                  ? "border border-success/20 bg-success/12 text-success"
                                  : "border border-danger/18 bg-danger/12 text-danger"
                              }`}
                            >
                              {isValidUpiUtr(forms[currentKey]?.utrNumber)
                                ? "UTR format valid"
                                : "12 digits required"}
                            </span>
                            <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b7c0cc]">
                              {remainingWaitSeconds > 0
                                ? `Wait ${remainingWaitSeconds}s`
                                : "Ready to submit"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            className="w-full"
                            disabled={
                              applicationsLocked ||
                              submittingId === currentKey ||
                              remainingWaitSeconds > 0 ||
                              !isValidUpiUtr(forms[currentKey]?.utrNumber)
                            }
                            onClick={() => onApply(activeInternship._id, currentDuration.key, true)}
                          >
                            {submittingId === currentKey
                              ? "Submitting paid application..."
                              : "Submit paid application"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={paymentLoadingId === currentKey || applicationsLocked}
                            onClick={() => generatePaymentQr(activeInternship._id, currentDuration.key)}
                          >
                            Generate fresh QR
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-success/18 bg-success/12 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-success/18 bg-[#0f1318] text-success">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#f5f7fa]">
                          Free application for {getDurationLabel(currentDuration)}
                        </p>
                        <p className="mt-1 text-xs leading-6 text-[#b7c0cc]">
                          No payment is required for this track. Your profile data will be used
                          automatically when the application is submitted.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="mt-5 w-full"
                      disabled={submittingId === currentKey || applicationsLocked}
                      onClick={() => onApply(activeInternship._id, currentDuration.key, false)}
                    >
                      {submittingId === currentKey ? "Submitting..." : "Apply with this duration"}
                    </Button>
                  </div>
                )}
              </div>
            ) : null
          }
        />
      </ModalShell>
    </>
  );

  function getRemainingWaitSeconds(paymentSession) {
    if (!paymentSession?.issuedAt || !paymentSession.minimumConfirmationSeconds) {
      return 0;
    }

    const issuedAtMs = new Date(paymentSession.issuedAt).getTime();
    if (Number.isNaN(issuedAtMs)) {
      return 0;
    }

    const elapsedSeconds = Math.floor((ticker - issuedAtMs) / 1000);
    return Math.max(0, paymentSession.minimumConfirmationSeconds - elapsedSeconds);
  }
}
