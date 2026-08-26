import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Clock,
  CheckCircle2,
  Filter,
  X,
  Mail,
  Building2,
  GraduationCap,
  ShieldCheck,
  IdCard
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminSupport() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [updateStatus, setUpdateStatus] = useState("In Progress");

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["admin-support-tickets", statusFilter, searchQuery],
    queryFn: async () => {
      const res = await api.get("/support/admin/all", {
        params: {
          status: statusFilter,
          search: searchQuery
        }
      });
      return res.data;
    },
    refetchInterval: 10000 // Refresh list every 10s
  });

  const tickets = ticketsData?.tickets || [];
  const unreadCount = ticketsData?.unreadCount || 0;

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message, status }) => {
      const res = await api.post(`/support/${ticketId}/reply`, { message, status });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Reply sent to student!");
      setReplyText("");
      setSelectedTicket(data.ticket);
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to send reply.");
    }
  });

  const changeStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }) => {
      const res = await api.patch(`/support/admin/${ticketId}/status`, { status });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Status updated to ${data.ticket.status}`);
      setSelectedTicket(data.ticket);
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
    onError: (err) => {
      toast.error("Failed to update status.");
    }
  });

  const openThread = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await api.get(`/support/${ticket._id}`);
      if (res.data?.ticket) {
        setSelectedTicket(res.data.ticket);
        queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    replyMutation.mutate({
      ticketId: selectedTicket._id,
      message: replyText,
      status: updateStatus
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
            Student Doubts & Q&A
          </div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--text)] md:text-3xl">
            Student Doubts & Support Portal
          </h1>
          <p className="text-sm text-[color:var(--text-secondary)]">
            Review student questions, view student IDs & details, and send answers to solve their doubts.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-500">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            {unreadCount} new unanswered doubt(s)
          </div>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Student Name, Email, Student ID, or Ticket ID..."
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-[color:var(--text-muted)] shrink-0" />
          {["all", "Open", "In Progress", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-primary text-white shadow"
                  : "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--text-secondary)] hover:bg-primary/5"
              }`}
            >
              {st === "all" ? "All Doubts" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Doubts List Table / Cards */}
      <Card>
        <CardHeader className="border-b border-[color:var(--border)] pb-4">
          <CardTitle className="text-lg">Student Questions ({tickets.length})</CardTitle>
          <CardDescription>
            Click any entry to inspect full student profile, view doubt thread, and reply.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-[color:var(--text-muted)]">
              Loading student questions...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center text-sm text-[color:var(--text-muted)]">
              No questions found matching your filter.
            </div>
          ) : (
            <div className="divide-y divide-[color:var(--border)]">
              {tickets.map((t) => {
                const studentName = t.student?.profile?.fullName || t.student?.fullName || "Student";
                const studentEmail = t.student?.email || "N/A";
                const studentId = t.student?._id || "N/A";
                const college = t.student?.profile?.college || "";

                return (
                  <div
                    key={t._id}
                    onClick={() => openThread(t)}
                    className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors ${
                      !t.isReadByAdmin
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-[color:var(--card-elevated)]"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {t.ticketId}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] border border-[color:var(--border)] px-2 py-0.5 rounded-full">
                          {t.category}
                        </span>
                        {!t.isReadByAdmin && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white">
                            New Question
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-base font-semibold text-[color:var(--text)] truncate">
                        {t.subject}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color:var(--text-secondary)]">
                        <span className="flex items-center gap-1 font-medium text-[color:var(--text)]">
                          <User className="h-3.5 w-3.5 text-primary" />
                          {studentName}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-[color:var(--text-muted)]">
                          <IdCard className="h-3.5 w-3.5" />
                          ID: {studentId}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[color:var(--text-muted)]">
                          <Mail className="h-3.5 w-3.5" />
                          {studentEmail}
                        </span>
                        {college && (
                          <span className="hidden lg:flex items-center gap-1 text-[11px] text-[color:var(--text-muted)]">
                            <Building2 className="h-3.5 w-3.5" />
                            {college}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <StatusBadge status={t.status} />
                      <Button variant="outline" size="sm" className="rounded-xl text-xs">
                        Reply
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Conversation Thread & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl h-[90vh] flex flex-col rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-elevated)] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--border)] p-4 sm:p-5 bg-[color:var(--card)]">
              <div className="space-y-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {selectedTicket.ticketId}
                  </span>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <h2 className="font-display text-base font-semibold text-[color:var(--text)] truncate">
                  {selectedTicket.subject}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-full p-2 text-[color:var(--text-muted)] hover:bg-primary/10 hover:text-[color:var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Student Info Bar */}
            <div className="bg-primary/5 border-b border-[color:var(--border)] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[color:var(--text-muted)] block">Student Name</span>
                  <span className="font-semibold text-[color:var(--text)]">
                    {selectedTicket.student?.profile?.fullName || selectedTicket.student?.fullName || "Student"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[color:var(--text-muted)] block">Student ID</span>
                  <span className="font-mono font-semibold text-primary">
                    {selectedTicket.student?._id || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[color:var(--text-muted)] block">Email</span>
                  <span className="text-[color:var(--text-secondary)]">
                    {selectedTicket.student?.email || "N/A"}
                  </span>
                </div>
                {selectedTicket.student?.profile?.phone && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[color:var(--text-muted)] block">Phone / WA</span>
                    <span className="text-[color:var(--text-secondary)]">
                      {selectedTicket.student?.profile?.phone}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[color:var(--text-muted)]">Set Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    changeStatusMutation.mutate({
                      ticketId: selectedTicket._id,
                      status: e.target.value
                    })
                  }
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-2.5 py-1 text-xs font-semibold text-[color:var(--text)]"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[color:var(--card-elevated)]">
              {selectedTicket.messages?.map((m, idx) => {
                const isAdmin = m.senderRole === "admin";
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--text-muted)] mb-1 px-1">
                      {isAdmin ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                          <span className="font-bold text-primary">You (Navyan Mentor)</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5" />
                          <span className="font-bold text-[color:var(--text)]">{m.senderName}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                        isAdmin
                          ? "border border-primary/20 bg-primary/10 text-[color:var(--text)] rounded-tr-sm"
                          : "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--text)] rounded-tl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form
              onSubmit={handleReplySubmit}
              className="border-t border-[color:var(--border)] p-4 bg-[color:var(--card)] space-y-3"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-[color:var(--text-muted)] uppercase tracking-wider">
                  Compose Answer / Reply
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-[color:var(--text-muted)]">After sending reply:</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="rounded-md border border-[color:var(--border)] bg-[color:var(--input-bg)] px-2 py-0.5 text-xs text-[color:var(--text)]"
                  >
                    <option value="In Progress">Keep In Progress</option>
                    <option value="Resolved">Mark as Resolved</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your solution / response to student..."
                  className="flex-1 rounded-xl"
                />
                <Button type="submit" disabled={replyMutation.isPending || !replyText.trim()} className="rounded-xl gap-2">
                  Send Answer
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "Resolved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
        <CheckCircle2 className="h-3 w-3" />
        Resolved
      </span>
    );
  }
  if (status === "In Progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
        <Clock className="h-3 w-3" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 text-xs font-semibold text-sky-500">
      <MessageSquare className="h-3 w-3" />
      Open
    </span>
  );
}
