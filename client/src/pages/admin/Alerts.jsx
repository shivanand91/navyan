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
  actionHref: "",
  type: "Announcement"
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
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const previewMessage = useMemo(() => {
    const message = form.message.trim();
    if (!message) return "Write a message to preview the broadcast notification.";
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
        actionHref: form.actionHref,
        type: form.type
      });

      setResult(data?.stats || null);
      toast.success(data?.message || "Broadcast sent to student notification bells.");
      setForm((current) => ({
        ...current,
        subject: "",
        message: ""
      }));
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
            Student dashboard notification
          </div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--text)] md:text-3xl">
            Send in-app alert to all students
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)]">
            Use this page for announcements, reminders, and daily updates. Broadcasts appear instantly in all Student Dashboard Notification Bells without consuming email limits.
          </p>
        </div>

        {result ? (
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total Students" value={result.total} />
            <Stat label="Bell Alerts Sent" value={result.inAppSent || result.sent} accent="success" />
            <Stat label="Failed" value={result.failed} accent="danger" />
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Compose broadcast alert
            </CardTitle>
            <CardDescription>
              Keep the message clear and direct. It will pop up in every student's dashboard notification bell icon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <Field label="Category / Type">
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--input-bg)] p-2.5 text-xs text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="General">General</option>
                    <option value="Important">Important</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Internship">Internship</option>
                  </select>
                </Field>

                <Field label="Subject / Heading">
                  <Input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Example: Tomorrow's task submission deadline"
                  />
                </Field>

                <Field label="Message">
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Write the message students should see in their notification bell."
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Action Button Label (Optional)">
                    <Input
                      name="actionLabel"
                      value={form.actionLabel}
                      onChange={handleChange}
                      placeholder="Open update"
                    />
                  </Field>
                  <Field label="Target Action URL (Optional)">
                    <Input
                      name="actionHref"
                      value={form.actionHref}
                      onChange={handleChange}
                      placeholder="/student/applications"
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                <p className="text-xs leading-6 text-[color:var(--text-muted)]">
                  Delivered to in-app student dashboard notifications without email charges.
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
            <CardTitle>Dashboard bell preview</CardTitle>
            <CardDescription>
              This is how the message will look when students open their notification bell.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Navyan {form.type || "alert"}
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold text-[color:var(--text)]">
                {form.subject || "Broadcast heading will appear here"}
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
                    In-App notification benefits
                  </p>
                  <ul className="space-y-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    <li>100% free with unlimited delivery.</li>
                    <li>Instantly lights up student notification bell icon.</li>
                    <li>Directly opens relevant page when clicked.</li>
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
    <div className="min-w-0 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold ${
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
