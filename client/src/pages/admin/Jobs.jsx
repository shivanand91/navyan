import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const createEmptyForm = () => ({
  title: "",
  slug: "",
  companyName: "Navyan",
  role: "",
  field: "",
  location: "",
  employmentType: "",
  sourceType: "internal",
  applyUrl: "",
  tags: "",
  description: "",
  isPublished: true
});

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [activeTab, setActiveTab] = useState("jobs");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const internalApplications = useMemo(
    () =>
      applications.filter((application) => application.job && application.job.sourceType === "internal"),
    [applications]
  );

  const load = async () => {
    try {
      const { data } = await api.get("/jobs/admin");
      setJobs(data.jobs || []);
      setApplications(data.applications || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load jobs admin.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
      };

      if (editingId) {
        await api.put(`/jobs/admin/${editingId}`, payload);
        toast.success("Job updated.");
      } else {
        const { data } = await api.post("/jobs/admin", payload);
        const sentCount = data?.emailStats?.sent || 0;
        toast.success(
          sentCount > 0 ? `Job created. ${sentCount} student notification emails sent.` : "Job created."
        );
      }

      resetForm();
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not save job.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      slug: job.slug || "",
      companyName: job.companyName || "",
      role: job.role || "",
      field: job.field || "",
      location: job.location || "",
      employmentType: job.employmentType || "",
      sourceType: job.sourceType || "internal",
      applyUrl: job.applyUrl || "",
      tags: Array.isArray(job.tags) ? job.tags.join(", ") : "",
      description: job.description || "",
      isPublished: job.isPublished !== false
    });

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (job) => {
    const shouldDelete = window.confirm(
      `Remove "${job.title}" from live listings?\n\nExisting portal applications will remain stored for admin follow-up.`
    );

    if (!shouldDelete) return;

    setDeletingId(job._id);
    try {
      await api.delete(`/jobs/admin/${job._id}`);
      toast.success("Job removed from live listings.");
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Jobs management</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Publish Navyan roles or external company opportunities from one control layer. Internal
          jobs collect student profiles inside the admin panel. External jobs redirect to the
          company apply link in a new tab.
        </p>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full gap-2 rounded-[24px] border border-slate-200 bg-white/70 p-2 dark:border-white/8 dark:bg-white/5">
          {[
            { key: "jobs", label: "Jobs", count: jobs.length },
            { key: "applications", label: "Portal applications", count: internalApplications.length }
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
        <>
          <form onSubmit={handleSubmit} className="navyan-card grid gap-4 p-5 text-xs md:grid-cols-2 xl:grid-cols-4">
            <Field label="Job title">
              <Input name="title" value={form.title} onChange={handleChange} />
            </Field>
            <Field label="Slug">
              <Input name="slug" value={form.slug} onChange={handleChange} />
            </Field>
            <Field label="Company name">
              <Input name="companyName" value={form.companyName} onChange={handleChange} />
            </Field>
            <Field label="Source type">
              <select
                name="sourceType"
                value={form.sourceType}
                onChange={handleChange}
                className="flex h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 text-sm text-[color:var(--text)] outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              >
                <option value="internal">Navyan portal apply</option>
                <option value="external">External company link</option>
              </select>
            </Field>

            <Field label="Role">
              <Input name="role" value={form.role} onChange={handleChange} />
            </Field>
            <Field label="Field">
              <Input name="field" value={form.field} onChange={handleChange} />
            </Field>
            <Field label="Location">
              <Input name="location" value={form.location} onChange={handleChange} />
            </Field>
            <Field label="Work style">
              <Input
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                placeholder="Remote / Hybrid / Onsite"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Apply link (external jobs only)">
                <Input
                  name="applyUrl"
                  value={form.applyUrl}
                  onChange={handleChange}
                  placeholder="https://company.com/apply"
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Tags (comma separated)">
                <Input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="React, Frontend, Fresher, Product"
                />
              </Field>
            </div>

            <div className="md:col-span-4">
              <Field label="Description">
                <Textarea
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-[#d7deea]">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={form.isPublished}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border border-[color:var(--border)]"
                />
                Publish immediately
              </label>

              <div className="flex gap-2">
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
                <Button type="submit" disabled={saving}>
                  {saving
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                      ? "Update job"
                      : "Create job"}
                </Button>
              </div>
            </div>
          </form>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Live and managed jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {jobs.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">
                  No jobs yet. Create the first opportunity.
                </p>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job._id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <p className="font-display text-xl font-semibold text-slate-900 dark:text-[#f5f7fa]">
                          {job.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-[#b7c0cc]">
                          {job.companyName} · {job.role || "Role not set"} · {job.location || "Flexible"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                            {job.sourceType === "internal" ? "Navyan portal" : "External link"}
                          </span>
                          <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-[#d7deea]">
                            {job.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(job)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          disabled={deletingId === job._id}
                          onClick={() => handleDelete(job)}
                        >
                          {deletingId === job._id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-[#d7deea]">
                      {job.description}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Internal job applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {internalApplications.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                Once students apply to Navyan portal jobs, their profiles will appear here.
              </p>
            ) : (
              internalApplications.map((application) => (
                <div
                  key={application._id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="font-display text-xl font-semibold text-slate-900 dark:text-[#f5f7fa]">
                        {application.applicantSnapshot?.fullName || application.user?.fullName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-[#b7c0cc]">
                        {application.job?.title} · {application.job?.companyName}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-[#d7deea]">
                        {application.applicantSnapshot?.email || application.user?.email}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-[#7e8794]">
                        {[
                          application.applicantSnapshot?.phone,
                          application.applicantSnapshot?.city,
                          application.applicantSnapshot?.college
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Profile basics available in the stored snapshot"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-[#7e8794]">
                        Applied on {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
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
                      {application.applicantSnapshot?.portfolioUrl ? (
                        <a
                          href={application.applicantSnapshot.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary"
                        >
                          Portfolio
                        </a>
                      ) : null}
                      {application.applicantSnapshot?.githubUrl ? (
                        <a
                          href={application.applicantSnapshot.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary"
                        >
                          GitHub
                        </a>
                      ) : null}
                      {application.applicantSnapshot?.linkedinUrl ? (
                        <a
                          href={application.applicantSnapshot.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary"
                        >
                          LinkedIn
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}
