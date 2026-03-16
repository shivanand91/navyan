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
  service: z.string().min(2),
  budgetRange: z.string().optional(),
  description: z.string().min(10),
  timeline: z.string().optional()
});

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values) => {
    try {
      await api.post("/service-inquiries", values);
      toast.success("Your inquiry has been received. Our team will get in touch.");
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
            Share a bit about your idea, timeline, and expectations. We&apos;ll respond with
            an honest view of what it takes to ship it well.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              t: "Premium execution",
              d: "Clean design system, scalable code, and a launch-ready finish."
            },
            {
              icon: Clock3,
              t: "Clear timelines",
              d: "Milestone-based delivery with updates you can trust."
            },
            {
              icon: MessageSquareText,
              t: "Fast response",
              d: "We reply with scope guidance and realistic next steps."
            }
          ].map((x) => (
            <div key={x.t} className="navyan-card p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f8efdd] text-[#6b5424] dark:bg-[#2b2417] dark:text-[#e9cc97]">
                <x.icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{x.t}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="navyan-card space-y-4 p-5">
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

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Project description
            </label>
            <Textarea
              rows={4}
              placeholder="Tell us about your idea, target users, and what success would look like."
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
              {isSubmitting ? "Sending..." : "Submit inquiry"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
