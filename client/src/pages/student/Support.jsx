import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  MessageCircle,
  X,
  User,
  ShieldCheck
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function StudentSupport() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newMessage, setNewMessage] = useState("");
  const [replyText, setReplyText] = useState("");

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["my-support-tickets"],
    queryFn: async () => {
      const res = await api.get("/support/my");
      return res.data;
    },
    refetchInterval: 10000 // Poll every 10 sec for fresh admin replies
  });

  const tickets = ticketsData?.tickets || [];

  const createTicketMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/support", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question submitted successfully!");
      setIsModalOpen(false);
      setNewSubject("");
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to submit question.");
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }) => {
      const res = await api.post(`/support/${ticketId}/reply`, { message });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Reply sent.");
      setReplyText("");
      setSelectedTicket(data.ticket);
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to send reply.");
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      toast.error("Please enter both a subject and your question.");
      return;
    }
    createTicketMutation.mutate({
      subject: newSubject,
      category: newCategory,
      message: newMessage
    });
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    replyMutation.mutate({
      ticketId: selectedTicket._id,
      message: replyText
    });
  };

  const openThread = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await api.get(`/support/${ticket._id}`);
      if (res.data?.ticket) {
        setSelectedTicket(res.data.ticket);
        queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <HelpCircle className="h-3.5 w-3.5" />
            Support & Mentorship
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold text-[color:var(--text)] md:text-3xl">
            Ask Doubts & Get Help
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Ask any question regarding your internship, tasks, projects, or certificates directly to Navyan mentors.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg sm:shrink-0">
          <Plus className="h-4 w-4" />
          Ask New Question
        </Button>
      </div>

      {/* Questions list */}
      <Card>
        <CardHeader className="border-b border-[color:var(--border)] pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            My Questions & Doubt Threads
          </CardTitle>
          <CardDescription>
            Click any question to view responses and reply to mentors.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-[color:var(--text-muted)]">
              Loading your questions...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <MessageCircle className="h-12 w-12 text-[color:var(--text-muted)] mx-auto opacity-50" />
              <p className="font-display text-base font-semibold text-[color:var(--text)]">
                No questions asked yet
              </p>
              <p className="text-xs text-[color:var(--text-muted)] max-w-sm mx-auto">
                Have a doubt about a task, code, or timeline? Click "Ask New Question" above to connect with a mentor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => openThread(t)}
                  className={`group relative flex flex-col gap-3 rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                    !t.isReadByStudent
                      ? "border-primary/40 bg-primary/5 shadow-md"
                      : "border-[color:var(--border)] bg-[color:var(--card)] hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {t.ticketId}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)] border border-[color:var(--border)] px-2 py-0.5 rounded-full">
                          {t.category}
                        </span>
                        {!t.isReadByStudent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white animate-pulse">
                            New Reply
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-base font-semibold text-[color:var(--text)] group-hover:text-primary transition-colors">
                        {t.subject}
                      </h3>
                    </div>

                    <StatusBadge status={t.status} />
                  </div>

                  <div className="flex items-center justify-between border-t border-[color:var(--border)]/60 pt-3 text-xs text-[color:var(--text-muted)]">
                    <p className="truncate max-w-[70%]">
                      Last message: <span className="text-[color:var(--text-secondary)] font-medium">{t.messages[t.messages.length - 1]?.text || "No messages"}</span>
                    </p>
                    <p className="flex items-center gap-1 text-[11px]">
                      <Clock className="h-3 w-3" />
                      {new Date(t.updatedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-[color:var(--text)]">
                  Ask a Doubt / Question
                </h2>
                <p className="text-xs text-[color:var(--text-muted)]">
                  Navyan mentors usually reply within a few hours.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[color:var(--text-muted)] hover:bg-primary/10 hover:text-[color:var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-3 text-sm font-medium text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="General" className="bg-[color:var(--card-elevated)] text-[color:var(--text)]">General Question</option>
                  <option value="Internship" className="bg-[color:var(--card-elevated)] text-[color:var(--text)]">Internship Guidance</option>
                  <option value="Task & Submission" className="bg-[color:var(--card-elevated)] text-[color:var(--text)]">Task & Submission Doubt</option>
                  <option value="Certificate" className="bg-[color:var(--card-elevated)] text-[color:var(--text)]">Certificate Request</option>
                  <option value="Technical" className="bg-[color:var(--card-elevated)] text-[color:var(--text)]">Technical Error / Issue</option>
                  <option value="Other" className="bg-[color:var(--card-elevated)] text-[color:var(--text)]">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Subject / Heading
                </label>
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Issue with task 2 GitHub link submission"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Detailed Question
                </label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={5}
                  placeholder="Explain your question or problem clearly so our mentors can assist you."
                  className="rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTicketMutation.isPending}>
                  {createTicketMutation.isPending ? "Submitting..." : "Submit Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conversation Thread Modal / Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl h-[85vh] flex flex-col rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-elevated)] shadow-2xl overflow-hidden">
            {/* Thread Header */}
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

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[color:var(--card-elevated)]">
              {selectedTicket.messages?.map((m, idx) => {
                const isAdmin = m.senderRole === "admin";
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--text-muted)] mb-1 px-1">
                      {isAdmin ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                          <span className="font-bold text-primary">Navyan Mentor</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5" />
                          <span>You</span>
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
                          ? "border border-primary/20 bg-primary/10 text-[color:var(--text)] rounded-tl-sm"
                          : "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--text)] rounded-tr-sm"
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
              className="border-t border-[color:var(--border)] p-3 sm:p-4 bg-[color:var(--card)] flex gap-2 items-center"
            >
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply or follow-up question..."
                className="flex-1 rounded-xl"
              />
              <Button type="submit" disabled={replyMutation.isPending || !replyText.trim()} size="icon" className="rounded-xl shrink-0">
                <Send className="h-4 w-4" />
              </Button>
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
