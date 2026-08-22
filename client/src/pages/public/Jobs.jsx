import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Clock3,
  ExternalLink,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";
import { ModalShell } from "@/components/premium/ModalShell";
import { buildJobFilterOptions, filterJobs } from "@/utils/jobs";
import { cn } from "@/lib/utils";

const createEmptyFilters = () => ({
  search: "",
  role: "",
  field: "",
  location: "",
  employmentType: ""
});

const normalizeExternalUrl = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`;
};

const getDescriptionPreview = (description) => {
  const text = String(description || "").trim();
  if (text) return text;
  return "View full role details, requirements, and the application path inside this opening.";
};

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(createEmptyFilters());
  const [activeJob, setActiveJob] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/jobs");
        setJobs(data.jobs || []);
      } catch (error) {
        console.error(error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filterOptions = useMemo(() => buildJobFilterOptions(jobs), [jobs]);
  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(createEmptyFilters());
  };

  return (
    <>
      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Careers at Navyan"
            title="Professional openings for students, freshers, and early-career talent."
            description="Explore curated Navyan roles and trusted external opportunities. Each card gives you a quick snapshot — open the full brief when a role feels like the right fit."
          />

          <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
            <RevealInView className="xl:sticky xl:top-28 xl:h-fit">
              <div className="navyan-panel p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-[#7e8794]">
                      Search and filter
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-[#b7c0cc]">
                      Narrow roles by title, field, location, and work style.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <FilterField label="Search jobs">
                    <Input
                      value={filters.search}
                      onChange={(event) => updateFilter("search", event.target.value)}
                      placeholder="Search title, company, skill..."
                    />
                  </FilterField>

                  <FilterField label="Role">
                    <FilterSelect
                      value={filters.role}
                      onChange={(event) => updateFilter("role", event.target.value)}
                      options={filterOptions.roles}
                    />
                  </FilterField>

                  <FilterField label="Field">
                    <FilterSelect
                      value={filters.field}
                      onChange={(event) => updateFilter("field", event.target.value)}
                      options={filterOptions.fields}
                    />
                  </FilterField>

                  <FilterField label="Location">
                    <FilterSelect
                      value={filters.location}
                      onChange={(event) => updateFilter("location", event.target.value)}
                      options={filterOptions.locations}
                    />
                  </FilterField>

                  <FilterField label="Work style">
                    <FilterSelect
                      value={filters.employmentType}
                      onChange={(event) => updateFilter("employmentType", event.target.value)}
                      options={filterOptions.employmentTypes}
                    />
                  </FilterField>

                  <Button variant="outline" className="w-full" onClick={resetFilters}>
                    Clear filters
                  </Button>
                </div>
              </div>
            </RevealInView>

            <div className="space-y-4">
              <div className="navyan-panel p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-[#7e8794]">
                      Open roles
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-[#b7c0cc]">
                      {filteredJobs.length} active opening{filteredJobs.length === 1 ? "" : "s"} across
                      Navyan and partner companies.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <TagPill icon={ShieldCheck} label="Navyan portal apply" />
                    <TagPill icon={ExternalLink} label="External apply links" />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="navyan-card h-[380px] animate-pulse bg-white/40 dark:bg-white/5"
                    />
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="navyan-panel p-8 text-center">
                  <p className="font-display text-2xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                    No jobs match these filters
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-[#b7c0cc]">
                    Clear the current filters and explore more roles across Navyan and partner teams.
                  </p>
                  <Button variant="outline" className="mt-5" onClick={resetFilters}>
                    Reset filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredJobs.map((job, index) => (
                    <RevealInView key={job._id} delay={index * 0.04} className="h-full">
                      <JobCard job={job} onViewMore={() => setActiveJob(job)} />
                    </RevealInView>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <JobDetailModal job={activeJob} user={user} onClose={() => setActiveJob(null)} />
    </>
  );
}

function JobCard({ job, onViewMore }) {
  const tags = [job.role, job.field, job.employmentType, ...(job.tags || [])].filter(Boolean).slice(0, 3);

  return (
    <article className="navyan-card group flex h-full min-h-[380px] flex-col overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:border-primary/35">
      <div className="border-b border-[color:var(--border)] bg-[color:var(--card)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
              job.isInternal
                ? "border border-primary/20 bg-primary/10 text-primary"
                : "border border-accent/20 bg-accent/12 text-accent"
            )}
          >
            {job.isInternal ? <ShieldCheck className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
            {job.isInternal ? "Navyan role" : "External role"}
          </span>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-primary/10 text-primary">
            {job.isInternal ? <BriefcaseBusiness className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 font-display text-xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-primary">{job.companyName}</p>
        </div>

        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-7 text-[color:var(--text-secondary)]">
          {getDescriptionPreview(job.description)}
        </p>

        {tags.length > 0 ? (
          <div className="mt-4 flex min-h-[32px] flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={`${job._id}-${tag}`}
                className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-4 min-h-[32px]" />
        )}

        <div className="mt-4 space-y-2 text-xs text-[color:var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{job.companyName}</span>
          </div>
          {job.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{job.location}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-auto border-t border-[color:var(--border)] pt-4">
          <Button variant="outline" className="w-full" onClick={onViewMore}>
            View more
            <ArrowUpRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function JobDetailModal({ job, user, onClose }) {
  if (!job) return null;

  const detailTags = [job.role, job.field, job.location, job.employmentType, ...(job.tags || [])].filter(Boolean);

  return (
    <ModalShell
      open={Boolean(job)}
      onClose={onClose}
      title={job.title}
      description={`${job.companyName}${job.location ? ` · ${job.location}` : ""}`}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
              job.isInternal
                ? "border border-primary/20 bg-primary/10 text-primary"
                : "border border-accent/20 bg-accent/12 text-accent"
            )}
          >
            {job.isInternal ? <ShieldCheck className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
            {job.isInternal ? "Apply through Navyan portal" : "Apply on company website"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-[11px] font-semibold text-[color:var(--text-secondary)]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Active opening
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailTile icon={Building2} label="Company" value={job.companyName} />
          {job.role ? <DetailTile icon={BriefcaseBusiness} label="Role" value={job.role} /> : null}
          {job.field ? <DetailTile icon={Sparkles} label="Field" value={job.field} /> : null}
          {job.location ? <DetailTile icon={MapPin} label="Location" value={job.location} /> : null}
          {job.employmentType ? (
            <DetailTile icon={Clock3} label="Work style" value={job.employmentType} />
          ) : null}
        </div>

        {detailTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {detailTags.map((tag) => (
              <span
                key={`${job._id}-modal-${tag}`}
                className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            Job description
          </p>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--text-secondary)]">
            {job.description?.trim() || "Detailed description will be shared during the application process."}
          </div>
        </div>

        <div className="rounded-[16px] border border-primary/15 bg-primary/10 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Ready to apply?
          </p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
            {job.isInternal
              ? "Submit your Navyan profile from the student dashboard to be considered for this internal role."
              : "You will be redirected to the company application page in a new tab."}
          </p>
          <div className="mt-5">
            {job.isInternal ? (
              user?.role === "student" ? (
                <Link to="/student/jobs" onClick={onClose}>
                  <Button className="w-full sm:w-auto">
                    Apply from dashboard
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/login" onClick={onClose}>
                  <Button className="w-full sm:w-auto">Log in to apply</Button>
                </Link>
              )
            ) : (
              <a href={normalizeExternalUrl(job.applyUrl)} target="_blank" rel="noreferrer">
                <Button className="w-full sm:w-auto">
                  Open apply link
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function DetailTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-4 py-3">
      <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-[color:var(--text)]">{value}</p>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-[#7e8794]">
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="flex h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 text-sm text-[color:var(--text)] outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function TagPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-semibold text-[color:var(--text-secondary)]">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </span>
  );
}
