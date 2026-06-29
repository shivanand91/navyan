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
import {
  getDurationPriceLabel,
  isPaidDuration
} from "@/utils/internshipPricing";

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
        <div className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)]">
          {internship.coverImageUrl ? (
            <img
              src={internship.coverImageUrl}
              alt={internship.title}
              className="h-[240px] w-full object-cover md:h-[300px]"
            />
          ) : (
            <div className="flex h-[240px] items-center justify-center bg-primary/10 text-sm text-[color:var(--text-secondary)] md:h-[300px]">
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
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
              {internship.mode?.toUpperCase() || "REMOTE"}
            </span>
            {internship.role ? (
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
                {internship.role}
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text)]">
              {internship.title}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[color:var(--text-secondary)]">
              {internship.shortDescription || internship.description}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Role</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[color:var(--text)]">
                {internship.role || "Applied internship track"}
              </p>
            </div>
            <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                <Laptop className="h-4 w-4 text-primary" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Mode</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[color:var(--text)]">
                {internship.mode?.toUpperCase() || "REMOTE"}
              </p>
            </div>
            <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                <Users2 className="h-4 w-4 text-primary" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Openings</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[color:var(--text)]">
                {internship.openings ? `${internship.openings} seats` : "Limited seats"}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
              What you will work on
            </p>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[color:var(--text-secondary)]">
              {internship.description || internship.shortDescription}
            </p>
          </div>

          <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
            <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
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
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-xs font-medium text-[color:var(--text-secondary)]"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[color:var(--text-secondary)]">General engineering readiness</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
            Internship details
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-4">
              <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  Last date to apply
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--text)]">
                  {formatDate(internship.lastDateToApply)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-4">
              <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  Duration options
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--text)]">
                  {(internship.durations || []).map(getDurationLabel).join(" • ") || "Custom"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
            Duration and pricing
          </p>
          <div className="mt-4 space-y-3">
            {(internship.durations || []).map((duration) => (
              <div
                key={duration.key}
                className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text)]">{getDurationLabel(duration)}</p>
                    <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                      {isPaidDuration(duration)
                        ? `Paid cohort • ${getDurationPriceLabel(duration)}`
                        : "Free internship track"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                      isPaidDuration(duration)
                        ? "border border-primary/20 bg-primary/10 text-primary"
                        : "border border-success/20 bg-success/12 text-success"
                    )}
                  >
                    {isPaidDuration(duration) ? "Paid" : "Free"}
                  </span>
                </div>
                {duration.benefits?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {duration.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-2.5 py-1 text-[11px] text-[color:var(--text-secondary)]"
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
