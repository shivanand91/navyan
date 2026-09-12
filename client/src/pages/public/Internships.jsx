import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import api from "@/lib/axios";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";
import { ModalShell } from "@/components/premium/ModalShell";
import { InternshipPreviewPanel } from "@/components/internships/InternshipPreviewPanel";
import { InternshipImage } from "@/components/internships/InternshipImage";
import { useAuth } from "@/context/AuthContext";
import { getDurationPriceLabel, isPaidDuration } from "@/utils/internshipPricing";

export default function Internships() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeInternship, setActiveInternship] = useState(null);
  const [selectedDurations, setSelectedDurations] = useState({});
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/internships");
        setInternships(data.internships || []);
      } catch (error) {
        console.error(error);
        setLoadError(error?.response?.data?.message || "Could not load internships right now. Please refresh in a moment.");
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
            title="Explore Professional Internships"
            description="Choose from our structured 4-week, 3-month, or 6-month tracks to kickstart your tech career."
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
          ) : loadError ? (
            <div className="navyan-card px-6 py-12 text-center">
              <p className="font-display text-2xl font-semibold text-textPrimary">Internships could not be loaded.</p>
              <p className="mt-3 text-sm text-textSecondary">{loadError}</p>
              <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Try again</Button>
            </div>
          ) : internships.length === 0 ? (
            <div className="navyan-card px-6 py-12 text-center">
              <p className="font-display text-2xl font-semibold text-textPrimary">
                No internships are live right now.
              </p>
              <p className="mt-3 text-sm text-textSecondary">
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
              {internships.map((internship, index) => {
                const selectedKey = selectedDurations[internship._id] || internship.durations?.[0]?.key;
                const selectedDuration = internship.durations?.find((duration) => duration.key === selectedKey) || internship.durations?.[0];
                // The first two legacy uploads are portrait/near-square artwork. They need a
                // full-bleed presentation; newer landscape artwork remains uncropped.
                const imageFit = index < 2 ? "cover" : "contain";
                return (
                  <RevealInView key={internship._id} delay={index * 0.03} className="h-full min-w-0">
                    <article className="navyan-card flex h-full min-w-0 flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5">
                      <div className="relative aspect-[16/9] shrink-0 overflow-hidden border-b border-[color:var(--border)] bg-gradient-to-br from-primary/10 via-[color:var(--card-elevated)] to-[color:var(--card)]">
                        <InternshipImage src={internship.coverImageUrl} alt={internship.title} fit={imageFit} className="block transition duration-500 hover:scale-[1.02]" />
                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-[color:var(--card)]/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-md"><Sparkles className="h-3.5 w-3.5" />Open now</div>
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">{internship.role || "Internship track"}</span>
                          <span className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">{internship.mode?.toUpperCase() || "REMOTE"}</span>
                        </div>
                        <div className="mt-4">
                          <h3 className="break-words font-display text-2xl font-semibold tracking-[-0.04em] text-textPrimary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                            {internship.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-textSecondary [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
                            {internship.shortDescription || internship.description || "Explore this Navyan internship opportunity."}
                          </p>
                        </div>

                        <div className="mt-4 flex min-h-7 flex-wrap gap-2 overflow-hidden">
                          {(internship.skillsRequired || []).slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 rounded-[14px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Choose duration</p>
                            <p className="text-xs font-semibold text-primary">{selectedDuration ? getDurationPriceLabel(selectedDuration) : "Flexible"}</p>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-1.5">
                            {(internship.durations || []).slice(0, 3).map((duration) => {
                              const selected = duration.key === selectedKey;
                              return (
                                <button
                                  key={duration.key}
                                  type="button"
                                  onClick={() => setSelectedDurations((current) => ({ ...current, [internship._id]: duration.key }))}
                                  className={`min-w-0 rounded-lg border px-1.5 py-2 text-center text-[10px] font-semibold transition ${selected ? "border-primary bg-primary text-white shadow-sm" : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--text-secondary)] hover:border-primary/40"}`}
                                >
                                  <span className="block truncate">{duration.label || duration.key}</span>
                                  <span className={`mt-0.5 block truncate text-[9px] ${selected ? "text-white/80" : "text-[color:var(--text-muted)]"}`}>{isPaidDuration(duration) ? getDurationPriceLabel(duration) : "Free"}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-auto flex shrink-0 flex-col gap-3 border-t border-[color:var(--border)] pt-4">
                          <Button variant="accent" className="w-full" onClick={() => setActiveInternship(internship)}>Apply Now</Button>
                        </div>
                      </div>
                    </article>
                  </RevealInView>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <ModalShell
        open={Boolean(activeInternship)}
        onClose={() => setActiveInternship(null)}
        title={activeInternship?.title}
        description="Inspect the role deeply before moving into the application workspace."
        constrainToViewport
        contentClassName="flex min-h-0 flex-1 overflow-y-auto px-5 py-5 xl:overflow-hidden md:px-6 md:py-6"
      >
        <InternshipPreviewPanel
          internship={activeInternship}
          scrollDescription
          aside={
            activeInternship ? (
              <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  Next step
                </p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
                  Open the student workspace to apply with your profile, choose a duration, and
                  complete payment only when the selected track requires it.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link to={user?.role === "student" ? `/student/internships?apply=${activeInternship._id}&duration=${selectedDurations[activeInternship._id] || activeInternship.durations?.[0]?.key || ""}` : "/login"}>
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
