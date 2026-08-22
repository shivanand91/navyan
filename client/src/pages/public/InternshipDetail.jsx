import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDurationPriceLabel, isPaidDuration } from "@/utils/internshipPricing";
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
            <Skeleton height={180} borderRadius={12} />
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
            <p className="font-medium text-textPrimary">Internship not found.</p>
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
        <div className="inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Internship details
        </div>
        <Card>
          <CardHeader>
            {internship.coverImageUrl && (
              <div className="mb-4 aspect-video w-full overflow-hidden rounded-[12px] bg-slate-100 dark:bg-slate-900/40">
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
            <div className="grid gap-3 md:grid-cols-3 text-xs text-textSecondary">
              <div className="rounded-[12px] bg-[color:var(--card-elevated)] p-3 flex items-center gap-2 border border-[color:var(--border)]">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <span>Role: {internship.role}</span>
              </div>
              <div className="rounded-[12px] bg-[color:var(--card-elevated)] p-3 flex items-center gap-2 border border-[color:var(--border)]">
                <Laptop className="h-4 w-4 text-primary" />
                <span>Mode: {internship.mode?.toUpperCase()}</span>
              </div>
              {internship.openings && (
                <div className="rounded-[12px] bg-[color:var(--card-elevated)] p-3 flex items-center gap-2 border border-[color:var(--border)]">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Openings: {internship.openings}</span>
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm text-textSecondary">
              <h3 className="font-semibold text-textPrimary">Overview</h3>
              <p className="whitespace-pre-line">{internship.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-textPrimary mb-2">
                  Skills you'll use
                </h4>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-textSecondary">
                  {internship.skillsRequired?.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-[8px] bg-[color:var(--card-elevated)] border border-[color:var(--border)] px-2.5 py-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-textPrimary mb-2">
                  Duration options
                </h4>
                <div className="space-y-1 text-xs text-textSecondary">
                  {internship.durations?.map((d) => (
                    <div
                      key={d.key}
                      className="flex items-center justify-between rounded-[10px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-2"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-textMuted" />
                        {d.label || d.key}
                      </span>
                      <span className="text-[11px]">
                        {isPaidDuration(d) ? `Paid • ${getDurationPriceLabel(d)}` : "Free"}{" "}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[color:var(--border)]">
              <p className="text-xs text-textMuted">
                You&apos;ll apply with your Navyan profile. Offer letter and tasks are
                managed from your dashboard when selected.
              </p>
              <Button variant="accent" onClick={() => navigate(`/student/internships?apply=${internship._id}`)}>
                Apply via student dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
