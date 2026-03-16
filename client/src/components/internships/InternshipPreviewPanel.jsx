import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Laptop,
  Sparkles,
  Target,
  Users2
} from "lucide-react";
import { cn } from "@/lib/utils";

const durationFallbackLabels = {
  "4-weeks": "4 weeks",
  "3-months": "3 months",
  "6-months": "6 months"
};

const formatDate = (value) => {
  if (!value) return "Rolling intake";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Rolling intake";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getDurationLabel = (duration) => duration?.label || durationFallbackLabels[duration?.key] || duration?.key;

export function InternshipPreviewPanel({ internship, aside, className }) {
  if (!internship) return null;

  return (
    <div className={cn("grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]", className)}>
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0f1318]">
          {internship.coverImageUrl ? (
            <img
              src={internship.coverImageUrl}
              alt={internship.title}
              className="h-[240px] w-full object-cover md:h-[300px]"
            />
          ) : (
            <div className="flex h-[240px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(212,168,95,0.18),transparent_58%),linear-gradient(180deg,#111418_0%,#171b21_100%)] text-sm text-[#b7c0cc] md:h-[300px]">
              Navyan internship preview
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Live opportunity
            </span>
            <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#b7c0cc]">
              {internship.mode?.toUpperCase() || "REMOTE"}
            </span>
            {internship.role ? (
              <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#b7c0cc]">
                {internship.role}
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="font-display text-3xl font-semibold tracking-[-0.05em] text-[#f5f7fa]">
              {internship.title}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[#b7c0cc]">
              {internship.shortDescription || internship.description}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-[#7e8794]">
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Role</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#f5f7fa]">
                {internship.role || "Applied internship track"}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-[#7e8794]">
                <Laptop className="h-4 w-4 text-primary" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Mode</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#f5f7fa]">
                {internship.mode?.toUpperCase() || "REMOTE"}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-[#7e8794]">
                <Users2 className="h-4 w-4 text-primary" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Openings</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#f5f7fa]">
                {internship.openings ? `${internship.openings} seats` : "Limited seats"}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7e8794]">
              What you will work on
            </p>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#b7c0cc]">
              {internship.description || internship.shortDescription}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-[#7e8794]">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                Skills in focus
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(internship.skillsRequired || []).length > 0 ? (
                internship.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/8 bg-[#0f1318] px-3 py-1 text-xs font-medium text-[#dce2e9]"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#b7c0cc]">General engineering readiness</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7e8794]">
            Cohort details
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-[#0f1318] p-4">
              <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8794]">
                  Last date to apply
                </p>
                <p className="mt-1 text-sm font-semibold text-[#f5f7fa]">
                  {formatDate(internship.lastDateToApply)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-[#0f1318] p-4">
              <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8794]">
                  Duration options
                </p>
                <p className="mt-1 text-sm font-semibold text-[#f5f7fa]">
                  {(internship.durations || []).map(getDurationLabel).join(" • ") || "Custom"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7e8794]">
            Duration and pricing
          </p>
          <div className="mt-4 space-y-3">
            {(internship.durations || []).map((duration) => (
              <div
                key={duration.key}
                className="rounded-[22px] border border-white/8 bg-[#0f1318] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#f5f7fa]">{getDurationLabel(duration)}</p>
                    <p className="mt-1 text-xs text-[#b7c0cc]">
                      {duration.isPaid || duration.price > 0
                        ? `Paid cohort${duration.price ? ` • Rs ${duration.price}` : ""}`
                        : "Free internship track"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                      duration.isPaid || duration.price > 0
                        ? "border border-primary/20 bg-primary/10 text-primary"
                        : "border border-success/20 bg-success/12 text-success"
                    )}
                  >
                    {duration.isPaid || duration.price > 0 ? "Paid" : "Free"}
                  </span>
                </div>
                {duration.benefits?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {duration.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-[#b7c0cc]"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {aside}
      </div>
    </div>
  );
}
