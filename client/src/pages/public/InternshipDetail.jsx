import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BadgeCheck, Calendar, Laptop, MapPin, Sparkles } from "lucide-react";

export default function InternshipDetail() {
  const { slug } = useParams();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/internships/slug/${slug}`);
        setInternship(data.internship);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <section className="navyan-section">
        <div className="mx-auto max-w-4xl px-4">
          <div className="navyan-card p-5 space-y-3">
            <Skeleton height={180} borderRadius={18} />
            <Skeleton width="60%" />
            <Skeleton count={3} />
          </div>
        </div>
      </section>
    );
  }

  if (!internship) {
    return (
      <section className="navyan-section">
        <div className="mx-auto max-w-4xl px-4">
          <div className="navyan-card p-5 text-sm">
            <p className="font-medium text-slate-700 dark:text-slate-200">Internship not found.</p>
            <Link to="/internships" className="mt-2 inline-block text-xs text-primary">
              Back to internships
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="navyan-section">
      <div className="mx-auto max-w-4xl px-4 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e4d4ad] bg-[#f8efdd] px-3 py-1 text-xs font-medium text-[#6b5424] dark:border-[#4b3f29] dark:bg-[#2b2417] dark:text-[#d6b77a]">
          <Sparkles className="h-3.5 w-3.5" />
          Internship details
        </div>
        <Card>
          <CardHeader>
            {internship.coverImageUrl && (
              <div className="mb-4 h-56 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900/40">
                <img
                  src={internship.coverImageUrl}
                  alt={internship.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardTitle className="text-xl md:text-2xl">{internship.title}</CardTitle>
            <CardDescription>{internship.shortDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-3 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <span>Role: {internship.role}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-3 flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary" />
                <span>Mode: {internship.mode?.toUpperCase()}</span>
              </div>
              {internship.openings && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Openings: {internship.openings}</span>
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Overview</h3>
              <p className="whitespace-pre-line">{internship.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Skills you'll use
                </h4>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {internship.skillsRequired?.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 dark:bg-slate-900/50 px-2.5 py-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Duration options
                </h4>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {internship.durations?.map((d) => (
                    <div
                      key={d.key}
                      className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-3 py-2"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {d.label || d.key}
                      </span>
                      <span className="text-[11px]">
                        {d.isPaid ? "Paid" : "Free"}{" "}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You&apos;ll apply with your Navyan profile. Offer letter and tasks are
                managed from your dashboard when selected.
              </p>
              <Button onClick={() => navigate(`/student/internships?apply=${internship._id}`)}>
                Apply via student dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
