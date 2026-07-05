import { useMemo, useState } from "react";
import { BellRing, Link2, Mail, Send, Sparkles } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const createEmptyForm = () => ({
  subject: "",
  message: "",
  actionLabel: "Open update",
  actionHref: ""
});

const LinkPreview = ({ value }) => {
  if (!value) return null;
  return (
    <span className="truncate rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-xs text-[color:var(--text-secondary)]">
      {value}
    </span>
  );
};

export default function AdminAlerts() {
  const [form, setForm] = useState(createEmptyForm());
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const previewMessage = useMemo(() => {
    const message = form.message.trim();
    if (!message) return "Write a message to preview the broadcast email.";
    return message;
  }, [form.message]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Subject and message are required.");
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const { data } = await api.post("/alerts/broadcast", {
        subject: form.subject,
        message: form.message,
        actionLabel: form.actionLabel,
        actionHref: form.actionHref
      });

      setResult(data?.stats || null);
      toast.success(data?.message || "Broadcast sent.");
      setForm((current) => ({ ...current, subject: "", message: "" }));
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not send broadcast.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <BellRing className="h-3.5 w-3.5" />
            Student broadcast
          </div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--text)] md:text-3xl">
            Send a message to all students
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)]">
            Use this page for announcements, reminders, and daily updates. You can include one
            clickable action link that appears inside the email.
          </p>
        </div>

        {result ? (
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total" value={result.total} />
            <Stat label="Sent" value={result.sent} accent="success" />
            <Stat label="Failed" value={result.failed} accent="danger" />
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Compose broadcast
            </CardTitle>
            <CardDescription>
              Keep the tone short, actionable, and clear. The email will be sent to every student
              account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <Field label="Subject">
                  <Input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Example: Tomorrow's task submission reminder"
                  />
                </Field>

                <Field label="Message">
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={10}
                    placeholder="Write the message students should receive. Line breaks are preserved."
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Link button text">
                    <Input
                      name="actionLabel"
                      value={form.actionLabel}
                      onChange={handleChange}
                      placeholder="Open update"
                    />
                  </Field>
                  <Field label="Link URL">
                    <Input
                      name="actionHref"
                      value={form.actionHref}
                      onChange={handleChange}
                      placeholder="https://navyan.online/student/applications"
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-6 text-[color:var(--text-muted)]">
                  Plain URLs in the message will also be clickable in the email.
                </p>
                <Button type="submit" disabled={sending} className="sm:min-w-44">
                  {sending ? "Sending..." : "Send to all students"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>
              This is how the message will feel in the inbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Navyan alert
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold text-[color:var(--text)]">
                {form.subject || "Your broadcast subject will appear here"}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                {previewMessage
                  .split(/\n\s*\n/g)
                  .map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" type="button">
                  {form.actionLabel || "Open update"}
                  <Link2 className="ml-2 h-4 w-4" />
                </Button>
                <LinkPreview value={form.actionHref} />
              </div>
            </div>

            <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <p className="font-display text-base font-semibold text-[color:var(--text)]">
                    Good broadcast habits
                  </p>
                  <ul className="space-y-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    <li>Keep the message short and direct.</li>
                    <li>Use the link field for the main action.</li>
                    <li>Use clear wording if the message is time-sensitive.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="min-w-0 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-semibold ${
          accent === "success"
            ? "text-emerald-500"
            : accent === "danger"
              ? "text-rose-500"
              : "text-[color:var(--text)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
