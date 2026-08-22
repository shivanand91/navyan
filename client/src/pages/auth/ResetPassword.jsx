import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BrandLogo from "@/components/BrandLogo";

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
    <section className="navyan-section min-h-[75vh] flex items-center justify-center px-4 md:px-6">
      <div className="w-full max-w-md">
        <div className="navyan-panel p-6 md:p-10 space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <BrandLogo imageClassName="h-9" surface="adaptive" />
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-textPrimary">
                Create new password
              </h1>
              <p className="text-sm text-textSecondary">
                Choose a strong, secure password for your Navyan account.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-textMuted">
                New Password
              </label>
              <Input type="password" placeholder="Enter new password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-danger font-medium mt-1">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-textMuted">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-danger font-medium mt-1">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <Button variant="accent" type="submit" disabled={isSubmitting || !token} className="w-full justify-center mt-2">
              {isSubmitting ? "Resetting password..." : "Reset password"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {!token ? (
            <p className="rounded-[12px] border border-danger/20 bg-danger/10 p-4 text-xs text-danger text-center">
              Reset token is missing. Please request a fresh password reset link.
            </p>
          ) : null}

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
