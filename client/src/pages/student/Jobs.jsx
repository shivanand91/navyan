import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RevealInView } from "@/components/premium/RevealInView";
import { buildJobFilterOptions, filterJobs } from "@/utils/jobs";
import { toast } from "sonner";

const createEmptyFilters = () => ({
  search: "",
  role: "",
  field: "",
  location: "",
  employmentType: ""
});

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [activeTab, setActiveTab] = useState("jobs");
  const [filters, setFilters] = useState(createEmptyFilters());

  const load = async () => {
    try {
      const [{ data: jobsData }, { data: applicationsData }] = await Promise.all([
        api.get("/jobs"),
        api.get("/jobs/me/applications")
      ]);
      setJobs(jobsData.jobs || []);
      setApplications(applicationsData.applications || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load jobs right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filterOptions = useMemo(() => buildJobFilterOptions(jobs), [jobs]);
  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const appliedJobIds = useMemo(
    () => new Set(applications.map((application) => application.job?._id).filter(Boolean)),
    [applications]
  );

  const applyToJob = async (job) => {
    if (!job?.isInternal) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setApplyingId(job._id);
    try {
      await api.post(`/jobs/${job._id}/apply`);
      toast.success("Your profile has been submitted for this job.");
      await load();
      setActiveTab("applied");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not apply to this job.");
    } finally {
      setApplyingId(null);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(createEmptyFilters());

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Jobs</h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Discover Navyan roles and external company openings from one focused workspace. Filter
          by role, field, location, and work style, then apply through the right channel.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[290px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Job filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilterField label="Search jobs">
                <Input
                  value={filters.search}
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="Search title, company, field..."
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-xs">
              <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <p className="text-slate-500 dark:text-[#7e8794]">Live jobs</p>
                <p className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-[#f5f7fa]">
                  {jobs.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <p className="text-slate-500 dark:text-[#7e8794]">Applied jobs</p>
                <p className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-[#f5f7fa]">
                  {applications.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-full gap-2 rounded-[24px] border border-slate-200 bg-white/70 p-2 dark:border-white/8 dark:bg-white/5">
              {[
                { key: "jobs", label: "Jobs", count: filteredJobs.length },
                { key: "applied", label: "Applied jobs", count: applications.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-2xl px-4 py-2 text-left transition ${
                    activeTab === tab.key
                      ? "bg-[#d4a85f] text-[#111418] shadow-[0_10px_30px_rgba(212,168,95,0.22)]"
                      : "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-[#b7c0cc] dark:hover:bg-white/6"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">
                    {tab.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{tab.count}</p>
                </button>
              ))}
            </div>
          </div>

          {activeTab === "jobs" ? (
            loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="navyan-card h-[260px] animate-pulse bg-white/40 dark:bg-white/5"
                  />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-slate-600 dark:text-[#b7c0cc]">
                  No jobs match your current filters.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredJobs.map((job, index) => {
                  const isApplied = appliedJobIds.has(job._id);

                  return (
                    <RevealInView key={job._id} delay={index * 0.04} className="h-full">
                      <Card className="h-full">
                        <CardHeader className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                    job.isInternal
                                      ? "border border-primary/20 bg-primary/10 text-primary"
                                      : "border border-accent/20 bg-accent/12 text-accent"
                                  }`}
                                >
                                  {job.isInternal ? "Navyan portal apply" : "External apply link"}
                                </span>
                              </div>
                              <p className="mt-3 font-display text-2xl font-semibold text-slate-900 dark:text-[#f5f7fa]">
                                {job.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-[#b7c0cc]">
                                {job.companyName}
                              </p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-primary">
                              {job.isInternal ? (
                                <ShieldCheck className="h-4 w-4" />
                              ) : (
                                <ExternalLink className="h-4 w-4" />
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
                              <Button
                                className="w-full"
                                disabled={isApplied || applyingId === job._id}
                                onClick={() => applyToJob(job)}
                              >
                                {isApplied
                                  ? "Already applied"
                                  : applyingId === job._id
                                    ? "Applying..."
                                    : "Apply with profile"}
                              </Button>
                            ) : (
                              <Button className="w-full" onClick={() => applyToJob(job)}>
                                Open apply link
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </RevealInView>
                  );
                })}
              </div>
            )
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-slate-600 dark:text-[#b7c0cc]">
                Internal jobs you apply to through Navyan will appear here.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((application) => (
                <Card key={application._id}>
                  <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="font-display text-xl font-semibold text-slate-900 dark:text-[#f5f7fa]">
                        {application.job?.title || "Job"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-[#b7c0cc]">
                        {application.job?.companyName} · {application.job?.location || "Flexible"}
                      </p>
                      <p className="text-sm leading-7 text-slate-700 dark:text-[#d7deea]">
                        Applied on {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                        {application.status}
                      </span>
                      {application.applicantSnapshot?.resumeUrl ? (
                        <a
                          href={application.applicantSnapshot.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary"
                        >
                          Resume
                        </a>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
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
