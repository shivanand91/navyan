import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";
import api from "@/lib/axios";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";
import { ModalShell } from "@/components/premium/ModalShell";
import { InternshipPreviewPanel } from "@/components/internships/InternshipPreviewPanel";
import { useAuth } from "@/context/AuthContext";
import { getDurationPriceLabel, isPaidDuration } from "@/utils/internshipPricing";

const durationFallbackLabels = {
  "4-weeks": "4 weeks",
  "3-months": "3 months",
  "6-months": "6 months"
};

const getDurationLabel = (duration) => duration?.label || durationFallbackLabels[duration?.key] || duration?.key;

export default function Internships() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInternship, setActiveInternship] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/internships");
        setInternships(data.internships || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Live Internships"
            title="Open internships organised like a serious product pipeline, not a random jobs board."
            description="Every role below is presented as a structured track. Browse the live list, open a modal for the full breakdown, and move into application from a cleaner workflow."
          />

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="navyan-card h-[440px] animate-pulse bg-white/40 dark:bg-white/5"
                />
              ))}
            </div>
          ) : internships.length === 0 ? (
            <div className="navyan-card px-6 py-12 text-center">
              <p className="font-display text-2xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                No internships are live right now.
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-[#b7c0cc]">
                Create a profile now and check back for new cohorts.
              </p>
              <Link to="/signup">
                <Button variant="outline" className="mt-6">
                  Create account
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {internships.map((internship, index) => (
                <RevealInView key={internship._id} delay={index * 0.03}>
                  <div className="navyan-card flex h-full flex-col overflow-hidden p-0">
                    <div className="relative aspect-video overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--card)]">
                      {internship.coverImageUrl ? (
                        <img
                          src={internship.coverImageUrl}
                          alt={internship.title}
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10 px-6 text-center text-sm text-[color:var(--text-secondary)]">
                          Navyan internship live
                        </div>
                      )}
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-[color:var(--card)]/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
                        <Sparkles className="h-3.5 w-3.5" />
                        Open now
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col px-5 py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
                          {internship.role || "Internship track"}
                        </span>
                        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
                          {internship.mode?.toUpperCase() || "REMOTE"}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-[#f5f7fa]">
                          {internship.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                          {internship.shortDescription}
                        </p>
                      </div>

                      <div className="mt-4 rounded-[22px] border border-primary/15 bg-primary/10 px-4 py-3">
                        <div className="flex items-center gap-2 text-primary">
                          <WalletCards className="h-4 w-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                            Duration model
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#825f25] dark:text-primary">
                          {(internship.durations || []).some(isPaidDuration)
                            ? "Paid tracks available"
                            : "Free tracks available"}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(internship.skillsRequired || []).slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 grid gap-2">
                        {(internship.durations || []).map((duration) => (
                          <div
                            key={duration.key}
                            className="rounded-[18px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-4 py-3"
                          >
                            <p className="text-xs font-semibold text-[color:var(--text)]">
                              {getDurationLabel(duration)}
                            </p>
                            <p className="mt-1 text-[11px] text-[color:var(--text-muted)]">
                              {isPaidDuration(duration)
                                ? `Paid • ${getDurationPriceLabel(duration)}`
                                : "Free"}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--border)] pt-4">
                        <p className="text-xs text-[color:var(--text-muted)]">
                          Preview the role first, then move into the full application flow.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => setActiveInternship(internship)}>
                            Preview role
                          </Button>
                          <Link to={`/internships/${internship.slug}`}>
                            <Button>
                              Apply now
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealInView>
              ))}
            </div>
          )}
        </div>
      </section>

      <ModalShell
        open={Boolean(activeInternship)}
        onClose={() => setActiveInternship(null)}
        title={activeInternship?.title}
        description="Inspect the role deeply before moving into the application workspace."
      >
        <InternshipPreviewPanel
          internship={activeInternship}
          aside={
            activeInternship ? (
              <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  Next step
                </p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
                  Open the student workspace to apply with your profile, choose a duration, and
                  complete payment only when the selected track requires it.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link to={user?.role === "student" ? `/student/internships?apply=${activeInternship._id}` : "/login"}>
                    <Button className="w-full">
                      {user?.role === "student" ? "Open application workflow" : "Login to apply"}
                    </Button>
                  </Link>
                  <Link to={`/internships/${activeInternship.slug}`}>
                    <Button variant="outline" className="w-full">
                      View full detail page
                    </Button>
                  </Link>
                </div>
              </div>
            ) : null
          }
        />
      </ModalShell>
    </>
  );
}
