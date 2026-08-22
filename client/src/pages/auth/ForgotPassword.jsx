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
import BrandLogo from "@/components/BrandLogo";

const schema = z.object({
  email: z.string().email("Please enter a valid email address")
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
    <section className="navyan-section min-h-[75vh] flex items-center justify-center px-4 md:px-6">
      <div className="w-full max-w-md">
        <div className="navyan-panel p-6 md:p-10 space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <BrandLogo imageClassName="h-9" surface="adaptive" />
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-textPrimary">
                Reset your password
              </h1>
              <p className="text-sm text-textSecondary">
                Enter your registered email address to receive a secure recovery link.
              </p>
            </div>
          </div>

          {sentEmail ? (
            <div className="rounded-[12px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
              <MailCheck className="h-6 w-6 text-emerald-500 mx-auto" />
              <p className="mt-3 text-sm font-semibold text-textPrimary">
                Check your inbox
              </p>
              <p className="mt-2 text-xs leading-5 text-textSecondary">
                If an account exists for <span className="font-semibold text-textPrimary">{sentEmail}</span>, a reset link has been sent.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-textMuted">
                Email Address
              </label>
              <Input type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-danger font-medium mt-1">{errors.email.message}</p>
              ) : null}
            </div>

            <Button variant="accent" type="submit" disabled={isSubmitting} className="w-full justify-center mt-2">
              {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="flex items-center justify-center border-t border-border pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
