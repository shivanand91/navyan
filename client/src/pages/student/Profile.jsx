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
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your profile</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          You only fill this once. We use it to auto-fill your internship applications, offer
          letters, and certificates.
        </p>
        {completion && (
          <div className="mt-4 max-w-xl rounded-3xl border border-[#e4d4ad] bg-[#f8efdd]/85 p-4 shadow-soft dark:border-[#4b3f29] dark:bg-[#2b2417]/70">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Profile completion</span>
              <span className="font-semibold text-primary">{completion.percentage}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#1d1d29]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
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
      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">{label}</label>
      {children}
    </div>
  );
}
