import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, FileCheck2, TrendingUp, Users, Zap } from "lucide-react";
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
          api.get("/applications/admin", { params: { view: "summary" } }),
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

  const stats = useMemo(
    () => [
      {
        label: "Total Applications",
        value: applications.length,
        icon: Users,
        color: "from-blue-500 to-blue-600",
        trend: "+12%"
      },
      {
        label: "Selected Candidates",
        value: applications.filter((a) => a.status === "Selected").length,
        icon: TrendingUp,
        color: "from-emerald-500 to-emerald-600",
        trend: "+8%"
      },
      {
        label: "Pending Review",
        value: submissions.filter((s) => s.reviewStatus === "Submitted").length,
        icon: BarChart3,
        color: "from-amber-500 to-amber-600",
        trend: "5 items"
      },
      {
        label: "Certificates Issued",
        value: certificates.length,
        icon: FileCheck2,
        color: "from-purple-500 to-purple-600",
        trend: "+3 new"
      }
    ],
    [applications, submissions, certificates]
  );

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
      "In Progress",
      "Completed",
      "Rejected"
    ]
      .map((status) => ({
        status: status.length > 10 ? status.substring(0, 10) + "..." : status,
        fullStatus: status,
        total: counts[status] || 0
      }))
      .filter((item) => item.total > 0);
  }, [applications]);

  const recentApplications = applications.slice(0, 8);
  const submissionStatus = useMemo(() => {
    return [
      { status: "Pending Review", count: submissions.filter((s) => s.reviewStatus === "Submitted").length },
      { status: "Reviewed", count: submissions.filter((s) => s.reviewStatus === "Reviewed").length },
      { status: "Completed", count: submissions.filter((s) => s.reviewStatus === "Completed").length }
    ];
  }, [submissions]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950 dark:from-slate-950 dark:to-[#0b0d10]">
      {/* Header Section */}
      <div className="border-b border-slate-700/50 dark:border-white/8 bg-slate-900/50 dark:bg-white/3 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Manage internships, applications, and submissions</p>
            </div>
            <Link to="/admin/applications">
              <Button size="lg" className="gap-2">
                <Zap className="h-4 w-4" />
                Go to Applications
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm p-6 hover:border-slate-600 dark:hover:border-white/20 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 bg-slate-700/50 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts and Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Large Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="border-b border-slate-700/50 dark:border-white/10 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Application Flow</h2>
              <p className="text-sm text-slate-400 mt-1">Track candidate progression through workflow stages</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationStatusData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4a85f" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#d4a85f" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="status" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "#1e293b",
                        color: "#f1f5f9"
                      }}
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    />
                    <Bar dataKey="total" fill="url(#colorGradient)" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Submission Status */}
          <div className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="border-b border-slate-700/50 dark:border-white/10 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Submission Status</h2>
              <p className="text-sm text-slate-400 mt-1">Review queue snapshot</p>
            </div>
            <div className="p-6 space-y-4">
              {submissionStatus.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-300">{item.status}</p>
                    <div className="w-32 h-2 bg-slate-700/50 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{
                          width: `${item.count * 20}%`,
                          maxWidth: "100%"
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Applications and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="border-b border-slate-700/50 dark:border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Recent Applications</h2>
                <p className="text-sm text-slate-400 mt-1">Latest candidate activity</p>
              </div>
              <Link to="/admin/applications">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-700/50 dark:divide-white/10">
              {recentApplications.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-400">
                  <p>No recent applications</p>
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app._id} className="px-6 py-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{app.user?.fullName || "Student"}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {app.internship?.title || "Internship"} • {app.durationKey}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/30">
                          {app.status}
                        </span>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-slate-800/50 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="border-b border-slate-700/50 dark:border-white/10 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Quick Navigation</h2>
              </div>
              <div className="p-4 space-y-2">
                <Link to="/admin/applications">
                  <Button variant="ghost" className="w-full justify-start text-left" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Applications ({applications.length})
                  </Button>
                </Link>
                <Link to="/admin/internships">
                  <Button variant="ghost" className="w-full justify-start text-left" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Internships ({internships.length})
                  </Button>
                </Link>
                <Link to="/admin/submissions">
                  <Button variant="ghost" className="w-full justify-start text-left" size="sm">
                    <FileCheck2 className="h-4 w-4 mr-2" />
                    Submissions ({submissions.length})
                  </Button>
                </Link>
                <Link to="/admin/service-inquiries">
                  <Button variant="ghost" className="w-full justify-start text-left" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Service Leads ({inquiries.length})
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-2xl border border-slate-700/50 dark:border-white/10 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm overflow-hidden p-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">Summary</p>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Selection Rate</span>
                  <span className="text-lg font-bold text-white">
                    {applications.length
                      ? Math.round(
                          (applications.filter((a) => a.status === "Selected").length / applications.length) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Completion Rate</span>
                  <span className="text-lg font-bold text-white">
                    {applications.length
                      ? Math.round(
                          (applications.filter((a) => a.status === "Completed").length / applications.length) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Active Programs</span>
                  <span className="text-lg font-bold text-white">{internships.filter((i) => i.isPublished).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
