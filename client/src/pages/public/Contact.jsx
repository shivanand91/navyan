import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock3, MessageSquareText } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  serviceId: z.string().optional(),
  service: z.string().min(2),
  inquiryType: z.enum(["inquiry", "call"]).default("inquiry"),
  budgetRange: z.string().optional(),
  description: z.string().min(10),
  timeline: z.string().optional(),
  scheduledCallAt: z.string().optional()
}).superRefine((values, ctx) => {
  if (values.inquiryType === "call" && !values.scheduledCallAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["scheduledCallAt"],
      message: "Select a date and time for the call."
    });
  }
});

export default function Contact() {
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      inquiryType: "inquiry",
      serviceId: "",
      service: "",
      scheduledCallAt: ""
    }
  });
  const inquiryType = watch("inquiryType");

  useEffect(() => {
    const service = searchParams.get("service");
    const serviceId = searchParams.get("serviceId");
    const mode = searchParams.get("mode");

    if (service) {
      setValue("service", service);
    }
    if (serviceId) {
      setValue("serviceId", serviceId);
    }
    if (mode === "call") {
      setValue("inquiryType", "call");
    } else if (mode === "inquiry") {
      setValue("inquiryType", "inquiry");
    }
  }, [searchParams, setValue]);

  const onSubmit = async (values) => {
    try {
      await api.post("/service-inquiries", values);
      toast.success(
        values.inquiryType === "call"
          ? "Your call request has been booked. Our team will reach out around the selected time."
          : "Your inquiry has been received. Our team will get in touch."
      );
      reset();
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="navyan-section">
      <div className="mx-auto max-w-3xl px-4 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
            Let&apos;s talk about your product.
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Share a bit about your idea, timeline, and expectations, or book a call directly.
            We&apos;ll respond with an honest view of what it takes to ship it well.
          </p>
        </div>

       

        <form onSubmit={handleSubmit(onSubmit)} className="navyan-card space-y-4 p-5">
          <input type="hidden" {...register("serviceId")} />
          <input type="hidden" {...register("inquiryType")} />

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setValue("inquiryType", "inquiry")}
              className={`rounded-[22px] border px-4 py-3 text-left transition ${
                inquiryType === "inquiry"
                  ? "border-primary/25 bg-primary/10"
                  : "border-[color:var(--border)] bg-[color:var(--card-elevated)]"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Service inquiry</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Send requirements and let us get back with scope and next steps.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setValue("inquiryType", "call")}
              className={`rounded-[22px] border px-4 py-3 text-left transition ${
                inquiryType === "call"
                  ? "border-primary/25 bg-primary/10"
                  : "border-[color:var(--border)] bg-[color:var(--card-elevated)]"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Book a call</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Reserve a preferred date and time for a discovery discussion.
              </p>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Name
              </label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Email
              </label>
              <Input {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Phone / WhatsApp
              </label>
              <Input {...register("phone")} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Company / Brand
              </label>
              <Input {...register("company")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Service
              </label>
              <Input placeholder="e.g. Web App, MVP" {...register("service")} />
              {errors.service && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.service.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Budget range (optional)
              </label>
              <Input placeholder="e.g. ₹2L–₹5L" {...register("budgetRange")} />
            </div>
          </div>

          {inquiryType === "call" ? (
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Preferred date and time
              </label>
              <Input type="datetime-local" {...register("scheduledCallAt")} />
              {errors.scheduledCallAt && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {errors.scheduledCallAt.message}
                </p>
              )}
            </div>
          ) : null}

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              {inquiryType === "call" ? "What should we discuss?" : "Project description"}
            </label>
            <Textarea
              rows={4}
              placeholder={
                inquiryType === "call"
                  ? "Tell us what you want to discuss in the call."
                  : "Tell us about your idea, target users, and what success would look like."
              }
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-[11px] text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Timeline (optional)
            </label>
            <Input placeholder="e.g. want to launch in 8–10 weeks" {...register("timeline")} />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? inquiryType === "call"
                  ? "Booking..."
                  : "Sending..."
                : inquiryType === "call"
                  ? "Book call"
                  : "Submit inquiry"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
