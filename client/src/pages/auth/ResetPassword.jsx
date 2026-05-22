import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your new password")
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        password: values.password
      });
      toast.success(data.message || "Password reset successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not reset password. Request a new link."));
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
              <div className="navyan-pill">Secure reset</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-[#f5f7fa]">
                Create a new password
              </h1>
              <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                Choose a fresh password for your Navyan account. After reset, old sessions are cleared.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-[#7e8794]">
                  New password
                </label>
                <Input type="password" placeholder="Enter new password" {...register("password")} />
                {errors.password ? (
                  <p className="mt-2 text-xs text-danger">{errors.password.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-[#7e8794]">
                  Confirm password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword ? (
                  <p className="mt-2 text-xs text-danger">{errors.confirmPassword.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={isSubmitting || !token} className="w-full">
                {isSubmitting ? "Resetting password..." : "Reset password"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {!token ? (
              <p className="rounded-[22px] border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                Reset token is missing. Please request a fresh password reset link.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
