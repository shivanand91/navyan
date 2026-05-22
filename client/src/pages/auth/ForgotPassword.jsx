import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email()
});

export default function ForgotPassword() {
  const [sentEmail, setSentEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const email = values.email.trim().toLowerCase();
      const { data } = await api.post("/auth/forgot-password", { email });
      setSentEmail(email);
      toast.success(data.message || "Password reset link sent if the account exists.");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not send reset link. Please try again."));
    }
  };

  return (
    <section className="navyan-section px-4 md:px-6">
      <div className="mx-auto max-w-xl">
        <div className="navyan-panel p-6 md:p-8">
          <div className="space-y-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>

            <div className="space-y-3">
              <div className="navyan-pill">Password recovery</div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-[#f5f7fa]">
                Reset your Navyan password
              </h1>
              <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                Enter your registered email. We will send a secure reset link that expires in 30 minutes.
              </p>
            </div>

            {sentEmail ? (
              <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5">
                <MailCheck className="h-6 w-6 text-emerald-500" />
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-[#f5f7fa]">
                  Check your inbox
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                  If an account exists for <span className="font-semibold">{sentEmail}</span>, a reset
                  link has been sent.
                </p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-[#7e8794]">
                  Email
                </label>
                <Input type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email ? (
                  <p className="mt-2 text-xs text-danger">{errors.email.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Sending reset link..." : "Send reset link"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
