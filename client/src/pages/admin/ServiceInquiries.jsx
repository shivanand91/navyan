import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  MessageCircle,
  Phone,
  XCircle
} from "lucide-react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/premium/ModalShell";
import { toast } from "sonner";

const statuses = [
  "New",
  "Contacted",
  "Meeting Scheduled",
  "Proposal Sent",
  "Closed Won",
  "Closed Lost"
];

const statusStyles = {
  New: "bg-primary/10 text-primary",
  Contacted: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
  "Meeting Scheduled": "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  "Proposal Sent": "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  "Closed Won": "bg-emerald-500/14 text-emerald-700 dark:text-emerald-300",
  "Closed Lost": "bg-rose-500/14 text-rose-700 dark:text-rose-300"
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";
  const raw = typeof value === "string" ? value : "";
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (match) {
    const [, year, month, day, hour24, minute] = match;
    const dateLabel = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
    const hour = Number(hour24);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = ((hour + 11) % 12) + 1;
    return `${dateLabel}, ${String(hour12).padStart(2, "0")}:${minute} ${period}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "Not scheduled";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const buildWhatsAppLink = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};

export default function ServiceInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeInquiry, setActiveInquiry] = useState(null);

  const summary = useMemo(
    () => ({
      total: inquiries.length,
      open: inquiries.filter((item) => !["Closed Won", "Closed Lost"].includes(item.status)).length,
      won: inquiries.filter((item) => item.status === "Closed Won").length,
      lost: inquiries.filter((item) => item.status === "Closed Lost").length
    }),
    [inquiries]
  );

  const load = async () => {
    try {
      const { data } = await api.get("/service-inquiries/admin");
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (id, status) => {
    setUpdatingId(id + status);
    try {
      const { data } = await api.patch(`/service-inquiries/admin/${id}`, { status });
      toast.success("Lead status updated.");
      setInquiries((current) =>
        current.map((item) => (item._id === id ? data.inquiry : item))
      );
      setActiveInquiry((current) => (current?._id === id ? data.inquiry : current));
    } catch (error) {
      console.error(error);
      toast.error("Could not update lead status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openCall = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!digits) {
      toast.error("No phone number found for this lead.");
      return;
    }

    window.open(`tel:${digits}`, "_self");
  };

  const openWhatsApp = (phone) => {
    const link = buildWhatsAppLink(phone);
    if (!link) {
      toast.error("No WhatsApp number found for this lead.");
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (inquiry) => {
    if (inquiry.status !== "Closed Lost") {
      toast.error("Only Closed Lost leads can be deleted.");
      return;
    }

    const shouldDelete = window.confirm(
      `Delete the lead for "${inquiry.name}" permanently from the backend?`
    );

    if (!shouldDelete) return;

    setDeletingId(inquiry._id);
    try {
      const { data } = await api.delete(`/service-inquiries/admin/${inquiry._id}`);
      toast.success(data.message || "Lead deleted.");
      setInquiries((current) => current.filter((item) => item._id !== inquiry._id));
      setActiveInquiry((current) => (current?._id === inquiry._id ? null : current));
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not delete lead.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Service leads</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Review every lead from a single page, open details in a modal, and close the project
          outcome without navigating away.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total leads" value={summary.total} />
        <SummaryCard label="Active leads" value={summary.open} />
        <SummaryCard label="Closed won" value={summary.won} accent="success" />
        <SummaryCard label="Closed lost" value={summary.lost} accent="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lead pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inquiries.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No service leads yet.</p>
          ) : (
            inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-semibold text-[color:var(--text)]">
                        {inquiry.name}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          statusStyles[inquiry.status] || statusStyles.New
                        }`}
                      >
                        {inquiry.status}
                      </span>
                      <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                        {inquiry.inquiryType === "call" ? "Booked call" : "Inquiry"}
                      </span>
                    </div>

                    <p className="text-sm text-[color:var(--text-secondary)]">
                      {inquiry.service} {inquiry.company ? `· ${inquiry.company}` : ""}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-[color:var(--text-muted)]">
                      <span>{inquiry.email}</span>
                      <span>{inquiry.phone || "No phone"}</span>
                      <span>{formatDateTime(inquiry.scheduledCallAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => openCall(inquiry.phone)}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openWhatsApp(inquiry.phone)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveInquiry(inquiry)}>
                      View details
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={updatingId === inquiry._id + "Closed Won"}
                      onClick={() => handleStatus(inquiry._id, "Closed Won")}
                    >
                      Closed Won
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={updatingId === inquiry._id + "Closed Lost"}
                      onClick={() => handleStatus(inquiry._id, "Closed Lost")}
                    >
                      Closed Lost
                    </Button>
                    {inquiry.status === "Closed Lost" ? (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={deletingId === inquiry._id}
                        onClick={() => handleDelete(inquiry)}
                      >
                        {deletingId === inquiry._id ? "Deleting..." : "Delete"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ModalShell
        open={Boolean(activeInquiry)}
        onClose={() => setActiveInquiry(null)}
        title={activeInquiry?.name || "Lead details"}
        description="Review the service requirement, contact the lead, and move the pipeline forward from one focused modal."
        className="max-w-5xl"
      >
        {activeInquiry ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailTile label="Service" value={activeInquiry.service} />
              <DetailTile label="Type" value={activeInquiry.inquiryType === "call" ? "Booked call" : "Service inquiry"} />
              <DetailTile label="Status" value={activeInquiry.status} accent={activeInquiry.status} />
              <DetailTile label="Call time" value={formatDateTime(activeInquiry.scheduledCallAt)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Requirement details
                  </p>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[color:var(--text-secondary)]">
                    {activeInquiry.description || "No description submitted."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Pipeline controls
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          status === "Closed Won"
                            ? "success"
                            : status === "Closed Lost"
                              ? "danger"
                              : "outline"
                        }
                        disabled={updatingId === activeInquiry._id + status}
                        onClick={() => handleStatus(activeInquiry._id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Contact details
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
                    <InfoRow label="Name" value={activeInquiry.name} />
                    <InfoRow label="Email" value={activeInquiry.email} />
                    <InfoRow label="Phone" value={activeInquiry.phone || "Not shared"} />
                    <InfoRow label="Company" value={activeInquiry.company || "Individual"} />
                    <InfoRow label="Budget" value={activeInquiry.budgetRange || "Not shared"} />
                    <InfoRow label="Timeline" value={activeInquiry.timeline || "Not shared"} />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Quick actions
                  </p>
                  <div className="mt-4 grid gap-2">
                    <Button variant="outline" onClick={() => openCall(activeInquiry.phone)}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call lead
                    </Button>
                    <Button variant="outline" onClick={() => openWhatsApp(activeInquiry.phone)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Open WhatsApp
                    </Button>
                    <Button
                      variant="success"
                      disabled={updatingId === activeInquiry._id + "Closed Won"}
                      onClick={() => handleStatus(activeInquiry._id, "Closed Won")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Closed Won
                    </Button>
                    <Button
                      variant="danger"
                      disabled={updatingId === activeInquiry._id + "Closed Lost"}
                      onClick={() => handleStatus(activeInquiry._id, "Closed Lost")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Mark Closed Lost
                    </Button>
                    {activeInquiry.status === "Closed Lost" ? (
                      <Button
                        variant="danger"
                        disabled={deletingId === activeInquiry._id}
                        onClick={() => handleDelete(activeInquiry)}
                      >
                        {deletingId === activeInquiry._id ? "Deleting..." : "Delete lead"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}

function SummaryCard({ label, value, accent = "default" }) {
  const accentClass =
    accent === "success"
      ? "text-emerald-600 dark:text-emerald-300"
      : accent === "danger"
        ? "text-rose-600 dark:text-rose-300"
        : "text-[color:var(--text)]";

  return (
    <div className="navyan-card p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}

function DetailTile({ label, value, accent }) {
  const accentClass =
    accent === "Closed Won"
      ? "text-emerald-600 dark:text-emerald-300"
      : accent === "Closed Lost"
        ? "text-rose-600 dark:text-rose-300"
        : "text-[color:var(--text)]";

  return (
    <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <p className={`mt-2 text-sm font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[18px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-4 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
        {label}
      </span>
      <span className="text-right text-sm text-[color:var(--text)]">{value}</span>
    </div>
  );
}
