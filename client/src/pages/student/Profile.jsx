import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/profile/me");
        reset(data.profile || {});
        setCompletion(data.completion || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      const { data } = await api.put("/profile/me", values);
      setCompletion(data.completion || null);
      toast.success("Profile updated. You can now apply to internships.");
    } catch (e) {
      console.error(e);
      toast.error("Could not update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <p className="text-sm text-textMuted">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-textPrimary">Settings</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Manage your account profile. This information is used to auto-fill applications, offer
          letters, and certificates.
        </p>
        {completion && (
          <div className="mt-4 max-w-xl rounded-[12px] border border-primary/20 bg-primary/10 p-4 shadow-soft">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-textSecondary">Profile completion</span>
              <span className="font-semibold text-primary">{completion.percentage}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-[8px] bg-slate-100 dark:bg-[#1d1d29]">
              <div
                className="h-full rounded-[8px] bg-primary"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-textMuted">
              Complete all required fields to unlock internship applications.
            </p>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="navyan-card grid gap-4 p-5 md:grid-cols-2"
      >
        <div className="space-y-3">
          <Field label="Full name">
            <Input {...register("fullName")} />
          </Field>
          <Field label="Email">
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Phone">
            <Input {...register("phone")} />
          </Field>
          <Field label="WhatsApp number">
            <Input {...register("whatsapp")} />
          </Field>
          <Field label="City">
            <Input {...register("city")} />
          </Field>
          <Field label="State">
            <Input {...register("state")} />
          </Field>
        </div>

        <div className="space-y-3">
          <Field label="College / Organization">
            <Input {...register("college")} />
          </Field>
          <Field label="Degree / Course">
            <Input {...register("degree")} />
          </Field>
          <Field label="Branch / Stream">
            <Input {...register("branch")} />
          </Field>
          <Field label="Current year / semester">
            <Input {...register("currentYear")} />
          </Field>
          <Field label="Graduation year">
            <Input {...register("graduationYear")} />
          </Field>
        </div>

        <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
          <Field label="Skills (comma separated)">
            <Input {...register("skills")} placeholder="React, Node.js, MongoDB" />
          </Field>
          <Field label="Preferred roles (comma separated)">
            <Input
              {...register("preferredRoles")}
              placeholder="Full Stack Intern, Frontend Intern"
            />
          </Field>
          <Field label="Previous internship experience">
            <Textarea rows={3} {...register("prevInternshipExperience")} />
          </Field>
          <Field label="Daily available hours">
            <Input type="number" {...register("dailyHours")} />
          </Field>
          <Field label="Laptop availability">
            <Input {...register("hasLaptop")} placeholder="Yes / No" />
          </Field>
          <Field label="Resume link (Drive/URL)">
            <Input {...register("resumeUrl")} />
          </Field>
          <Field label="GitHub">
            <Input {...register("githubUrl")} />
          </Field>
          <Field label="LinkedIn">
            <Input {...register("linkedinUrl")} />
          </Field>
          <Field label="Portfolio (optional)">
            <Input {...register("portfolioUrl")} />
          </Field>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/75 p-4 shadow-soft">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-textPrimary">
                  Job email preferences
                </h2>
                <p className="text-sm text-textSecondary">
                  Turn this on if you want Navyan to email you whenever new job opportunities are
                  published.
                </p>
              </div>

              <label className="inline-flex items-center gap-3 rounded-[10px] border border-[color:var(--border)] bg-white/70 px-4 py-3 text-sm font-medium text-textSecondary shadow-sm dark:bg-[color:var(--bg-elevated)]">
                <input
                  type="checkbox"
                  {...register("allowJobEmails")}
                  className="h-4 w-4 rounded border border-[color:var(--border)] text-primary accent-[color:var(--primary)]"
                />
                Allow job alert emails
              </label>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-textSecondary block">{label}</label>
      {children}
    </div>
  );
}
