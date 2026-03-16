import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import HeroScene from "@/components/premium/HeroScene";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const payload = {
        email: values.email.trim().toLowerCase(),
        password: values.password
      };
      const { data } = await api.post("/auth/login", payload);
      login(data.accessToken, data.user);
      toast.success("Welcome back to Navyan.");
      const redirect =
        data.user.role === "admin"
          ? "/admin"
          : (location.state && location.state.from) || "/student";
      navigate(redirect, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Invalid credentials. Please try again."));
    }
  };

  return (
    <section className="navyan-section px-4 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <div className="relative hidden min-h-[620px] overflow-hidden rounded-[32px] border border-white/8 bg-[#0f1318]/78 p-8 shadow-soft lg:block">
          <HeroScene className="absolute inset-0 opacity-90" />
          <div className="navyan-grid-mask" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="space-y-4">
              <div className="navyan-pill">Secure access</div>
              <h1 className="max-w-xl font-display text-5xl font-semibold tracking-[-0.06em] text-[#f5f7fa]">
                Return to your internship and workflow command center.
              </h1>
              <p className="max-w-lg text-sm leading-8 text-[#b7c0cc]">
                Students track their journey. Admins operate the platform. The interface stays
                fast, structured, and premium in both cases.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Secure sessions" },
                { icon: UserRound, title: "Role-aware access" },
                { icon: Sparkles, title: "Premium dashboards" }
              ].map((item) => (
                <div key={item.title} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="mt-4 text-sm font-semibold text-[#f5f7fa]">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="navyan-panel p-6 md:p-8">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-3">
              <div className="navyan-pill">Login</div>
              <h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-[#f5f7fa]">
                Access your Navyan workspace
              </h2>
              <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                Use your student or admin credentials to continue where you left off.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-[#7e8794]">
                  Email
                </label>
                <Input type="email" placeholder="you@navyan.dev" {...register("email")} />
                {errors.email ? (
                  <p className="mt-2 text-xs text-danger">{errors.email.message}</p>
                ) : null}
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-[#7e8794]">
                  Password
                </label>
                <Input type="password" placeholder="Enter your password" {...register("password")} />
                {errors.password ? (
                  <p className="mt-2 text-xs text-danger">{errors.password.message}</p>
                ) : null}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Logging in..." : "Log in"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="rounded-[22px] border border-black/8 bg-black/[0.025] p-4 text-sm text-slate-700 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]">
              New to Navyan?{" "}
              <Link to="/signup" className="font-semibold text-primary">
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
