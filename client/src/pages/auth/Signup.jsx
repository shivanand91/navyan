import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password
      };
      const { data } = await api.post("/auth/register", payload);
      login(data.accessToken, data.user);
      toast.success("Welcome to Navyan. Let’s set up your profile.");
      navigate("/student/profile");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not create account. Try a different email."));
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
                Create your account
              </h1>
              <p className="text-sm text-textSecondary">
                Join Navyan to start your internship and track your career growth.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-textMuted">
                Full name
              </label>
              <Input placeholder="Your full name" {...register("fullName")} />
              {errors.fullName ? (
                <p className="text-xs text-danger font-medium mt-1">{errors.fullName.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-textMuted">
                Email Address
              </label>
              <Input type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-danger font-medium mt-1">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-textMuted">
                Password
              </label>
              <PasswordInput placeholder="Choose a secure password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-danger font-medium mt-1">{errors.password.message}</p>
              ) : null}
            </div>

            <Button variant="accent" type="submit" disabled={isSubmitting} className="w-full justify-center mt-2">
              {isSubmitting ? "Creating account..." : "Get started with Navyan"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="rounded-[12px] border border-border bg-backgroundSecondary p-4 text-sm text-center text-textSecondary">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
