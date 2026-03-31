import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  MapPin,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";
import { buildJobFilterOptions, filterJobs } from "@/utils/jobs";

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

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(createEmptyFilters());

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
    <section className="navyan-section px-4 md:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Job board"
          title="Premium openings for students, freshers, and early-career builders."
          description="Browse Navyan roles and external company opportunities from one structured surface. Use filters on the left, compare role signals on the right, and move quickly when a match feels right."
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
                    Narrow jobs by role, field, location, and work style.
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
                    Live job feed
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-[#b7c0cc]">
                    {filteredJobs.length} role{filteredJobs.length === 1 ? "" : "s"} available
                    across Navyan and external partner opportunities.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TagPill icon={ShieldCheck} label="Internal portal roles" />
                  <TagPill icon={ExternalLink} label="External apply links" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="navyan-card h-[280px] animate-pulse bg-white/40 dark:bg-white/5"
                  />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="navyan-panel p-8 text-center">
                <p className="font-display text-2xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  No jobs match these filters
                </p>
                <p className="mt-3 text-sm text-slate-600 dark:text-[#b7c0cc]">
                  Clear the current filters and refresh the job feed to explore more roles.
                </p>
                <Button variant="outline" className="mt-5" onClick={resetFilters}>
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredJobs.map((job, index) => (
                  <RevealInView key={job._id} delay={index * 0.04} className="h-full">
                    <Card className="h-full">
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  job.isInternal
                                    ? "border border-primary/20 bg-primary/10 text-primary"
                                    : "border border-accent/20 bg-accent/12 text-accent"
                                }`}
                              >
                                {job.isInternal ? "Apply on Navyan" : "External company link"}
                              </span>
                            </div>
                            <CardTitle className="text-2xl">{job.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {job.companyName}
                            </CardDescription>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-primary">
                            {job.isInternal ? (
                              <ShieldCheck className="h-4 w-4" />
                            ) : (
                              <Building2 className="h-4 w-4" />
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {[job.role, job.field, job.location, job.employmentType, ...(job.tags || [])]
                            .filter(Boolean)
                            .map((tag) => (
                              <span
                                key={`${job._id}-${tag}`}
                                className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-700 dark:text-[#c7cfdb]"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      </CardHeader>
                      <CardContent className="flex h-full flex-col">
                        <p className="text-sm leading-7 text-slate-700 dark:text-[#c7cfdb]">
                          {job.description}
                        </p>

                        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500 dark:text-[#7e8794]">
                          <BriefcaseBusiness className="h-4 w-4" />
                          <span>{job.companyName}</span>
                          {job.location ? (
                            <>
                              <span>•</span>
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </>
                          ) : null}
                        </div>

                        <div className="mt-6">
                          {job.isInternal ? (
                            user?.role === "student" ? (
                              <Link to="/student/jobs">
                                <Button className="w-full">
                                  Apply from dashboard
                                  <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            ) : (
                              <Link to="/login">
                                <Button className="w-full">Log in to apply</Button>
                              </Link>
                            )
                          ) : (
                            <a href={normalizeExternalUrl(job.applyUrl)} target="_blank" rel="noreferrer">
                              <Button className="w-full">
                                Open company apply link
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </RevealInView>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
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
    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-[#d9e0ea]">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </span>
  );
}
