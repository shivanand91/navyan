import { Users, CheckCircle2, Play, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function About() {
  const stats = [
    {
      icon: Users,
      value: "1,000+",
      label: "Monthly Visitors",
      desc: "Ambitious students and businesses exploring digital execution pathways."
    },
    {
      icon: CheckCircle2,
      value: "300+",
      label: "Completed Internships",
      desc: "Graduates equipped with real-world engineering and product skills."
    },
    {
      icon: Play,
      value: "500+",
      label: "Running Internships",
      desc: "Active students currently building production-grade workflows."
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Verifiable Certificates",
      desc: "Cryptographically secured registry records accessible globally."
    }
  ];

  return (
    <div className="space-y-16 py-12 md:py-20">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold border border-border bg-backgroundSecondary text-primary">
          Our Identity & Purpose
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-[-0.04em] text-textPrimary leading-tight max-w-3xl mx-auto">
          Driven by talent. <br className="hidden sm:inline" />
          Focused on execution.
        </h1>
        <p className="text-base md:text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed">
          Navyan bridges the gap between learning and delivery, serving as a structured internship launchpad for developers and a high-performance product studio for companies.
        </p>
      </section>

      {/* Metrics Section */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="navyan-card p-6 flex flex-col justify-between space-y-6">
              <div className="w-10 h-10 rounded-[10px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="font-display text-4xl font-semibold tracking-[-0.04em] text-textPrimary">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-textPrimary">
                  {stat.label}
                </p>
                <p className="text-xs leading-relaxed text-textSecondary">
                  {stat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values Section */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 grid gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-textPrimary">
            Built like a product, not a template.
          </h2>
          <p className="text-sm leading-relaxed text-textSecondary">
            We believe internships should cultivate production-ready code habits, and services should be delivered with absolute design fidelity and structured architectures.
          </p>
          <div className="pt-2">
            <Link to="/internships">
              <Button variant="accent">
                Browse Programs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
          {[
            { k: "Clarity", v: "Transparent stages from application, tasks, execution, to final verification." },
            { k: "Craft", v: "Clean React/Node setups with custom design systems, not boilerplate." },
            { k: "Trust", v: "Secure verification keys for student credentials to build professional credibility." },
            { k: "Growth", v: "Direct engineering reviews that prepare developers for high-performing roles." }
          ].map((item) => (
            <div key={item.k} className="navyan-card p-6 bg-card-elevated border border-border/80">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-textMuted">
                {item.k}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-textSecondary">
                {item.v}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
