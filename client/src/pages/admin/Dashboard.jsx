import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, FileCheck2, Layers3, MessageSquareText, Users2 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/premium/MetricCard";
import { RevealInView } from "@/components/premium/RevealInView";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [apps, ints, leads, submitted, issued] = await Promise.all([
          api.get("/applications/admin"),
          api.get("/internships/admin"),
          api.get("/service-inquiries/admin"),
          api.get("/submissions/admin"),
          api.get("/certificates/admin")
        ]);

        setApplications(apps.data.applications || []);
        setInternships(ints.data.internships || []);
        setInquiries(leads.data.inquiries || []);
        setSubmissions(submitted.data.submissions || []);
        setCertificates(issued.data.certificates || []);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  const applicationStatusData = useMemo(() => {
    const counts = applications.reduce((acc, application) => {
      acc[application.status] = (acc[application.status] || 0) + 1;
      return acc;
    }, {});

    return [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Selected",
      "Completed",
      "Rejected"
    ].map((status) => ({
      status,
      total: counts[status] || 0
    }));
  }, [applications]);

  const leadPipelineData = useMemo(() => {
    const counts = inquiries.reduce((acc, inquiry) => {
      acc[inquiry.status] = (acc[inquiry.status] || 0) + 1;
      return acc;
    }, {});

    return [
      "New",
      "Contacted",
      "Meeting Scheduled",
      "Proposal Sent",
      "Closed Won",
      "Closed Lost"
    ].map((status) => ({
      status,
      total: counts[status] || 0
    }));
  }, [inquiries]);

  const workflowPulseData = useMemo(
    () => [
      { label: "Applications", total: applications.length },
      { label: "Submissions", total: submissions.length },
      { label: "Certificates", total: certificates.length },
      { label: "Leads", total: inquiries.length }
    ],
    [applications.length, submissions.length, certificates.length, inquiries.length]
  );

  const recentApplications = applications.slice(0, 5);
  const recentLeads = inquiries.slice(0, 5);

  return (
    <div className="space-y-8">
      <RevealInView>
        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="navyan-card px-6 py-6">
            <div className="space-y-3">
              <div className="navyan-pill">Admin overview</div>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-[#f5f7fa]">
                Operate internships, talent, documents, and service leads from one control layer.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                The admin workspace is designed for fast scanning, confident decisions, and
                premium workflow visibility across student progress and service delivery.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/8 bg-[#101419]/94 px-5 py-5 text-[#f5f7fa]">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7e8794]">Selection rate</p>
                <p className="mt-2 font-display text-4xl font-semibold text-primary">
                  {applications.length
                    ? Math.round(
                        (applications.filter((application) => application.status === "Selected").length /
                          applications.length) *
                          100
                      )
                    : 0}
                  %
                </p>
                <p className="mt-2 text-sm text-[#b7c0cc]">Selected candidates out of total applicants</p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/5 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                  Open internships
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  {internships.filter((internship) => internship.isPublished).length}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-[#b7c0cc]">
                  Live opportunities available to students.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/5 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                  Review queue
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  {submissions.filter((submission) => submission.reviewStatus === "Submitted").length}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-[#b7c0cc]">
                  Submission items currently waiting on admin review.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <MetricCard label="Applications" value={applications.length} hint="Candidates" icon={Users2} tone="gold" />
            <MetricCard label="Internships" value={internships.length} hint="Programs" icon={BriefcaseBusiness} tone="violet" />
            <MetricCard label="Service leads" value={inquiries.length} hint="Pipeline" icon={MessageSquareText} tone="cyan" />
            <MetricCard label="Certificates" value={certificates.length} hint="Issued" icon={FileCheck2} tone="success" />
          </div>
        </div>
      </RevealInView>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <RevealInView className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Application status mix</CardTitle>
                <p className="mt-1 text-sm text-slate-600 dark:text-[#b7c0cc]">
                  Track how candidates are moving through the internship lifecycle.
                </p>
              </div>
              <Link to="/admin/applications">
                <Button variant="outline" size="sm">
                  Open applications
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="status" tick={{ fill: "#7E8794", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7E8794", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 18,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#111418",
                      color: "#F5F7FA"
                    }}
                  />
                  <Bar dataKey="total" radius={[12, 12, 0, 0]} fill="#D4A85F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Recent candidate activity</CardTitle>
                <p className="mt-1 text-sm text-slate-600 dark:text-[#b7c0cc]">
                  The latest application-side movement that may need a decision.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentApplications.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-[#b7c0cc]">
                  No candidate activity yet.
                </p>
              ) : (
                recentApplications.map((application) => (
                  <div key={application._id} className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                          {application.user?.fullName || "Candidate"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#7e8794]">
                          {application.internship?.title || "Internship"} • {application.durationKey}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-[#7e8794]">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">{application.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </RevealInView>

        <RevealInView className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Service lead pipeline</CardTitle>
                <p className="mt-1 text-sm text-slate-600 dark:text-[#b7c0cc]">
                  Monitor how inbound service conversations are advancing.
                </p>
              </div>
              <Link to="/admin/service-inquiries">
                <Button variant="ghost" size="sm">
                  View pipeline
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadPipelineData}>
                  <defs>
                    <linearGradient id="leadArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="status" tick={{ fill: "#7E8794", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7E8794", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 18,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#111418",
                      color: "#F5F7FA"
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={3} fill="url(#leadArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Workflow pulse</CardTitle>
                <p className="mt-1 text-sm text-slate-600 dark:text-[#b7c0cc]">
                  A fast snapshot across operational areas.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workflowPulseData} layout="vertical" margin={{ left: 14 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={92}
                      tick={{ fill: "#7E8794", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 18,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "#111418",
                        color: "#F5F7FA"
                      }}
                    />
                    <Bar dataKey="total" radius={[0, 12, 12, 0]} fill="#D4A85F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {recentLeads.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-[#b7c0cc]">No service leads yet.</p>
                ) : (
                  recentLeads.map((lead) => (
                    <div key={lead._id} className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                          {lead.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#7e8794]">
                          {lead.service} • {lead.company || "Individual"}
                        </p>
                      </div>
                      <Link to="/admin/service-inquiries" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </RevealInView>
      </div>
    </div>
  );
}
