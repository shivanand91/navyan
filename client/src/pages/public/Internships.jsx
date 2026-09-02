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
  const [loadError, setLoadError] = useState("");
  const [activeInternship, setActiveInternship] = useState(null);
  const [selectedDurations, setSelectedDurations] = useState({});

  const getRewardsText = (duration) => {
    if (duration.rewards && duration.rewards.length > 0) {
      return duration.rewards.join(", ");
    }
    if (duration.key === "3-months") return "Top Performer Reward: ₹5,000";
    if (duration.key === "6-months") return "Top Performer Reward: ₹8,000";
    if (duration.key === "4-weeks") return "Swag & Performance Recognition";
    return null;
  };

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
                const selectedKey = selectedDurations[internship._id] || internship.durations?.[0]?.key || "4-weeks";
                const selectedDuration = internship.durations?.find(d => d.key === selectedKey) || internship.durations?.[0];
                return (
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
                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-[color:var(--card)]/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
                          <Sparkles className="h-3.5 w-3.5" />
                          Open now
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col px-5 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
                            {internship.role || "Internship track"}
                          </span>
                          <span className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
                            {internship.mode?.toUpperCase() || "REMOTE"}
                          </span>
                        </div>

                        <div className="mt-4">
                          <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-textPrimary">
                            {internship.title}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-textSecondary">
                            {internship.shortDescription}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(internship.skillsRequired || []).slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-medium text-[color:var(--text-secondary)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Segmented Duration Selector */}
                        <div className="mt-5 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-4 space-y-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
                            Select Cohort Duration:
                          </p>
                          <div className="flex rounded-[8px] border border-[color:var(--border)] bg-[color:var(--bg-secondary)] p-0.5">
                            {(internship.durations || []).map((duration) => {
                              const isSelected = selectedKey === duration.key;
                              return (
                                <button
                                  key={duration.key}
                                  type="button"
                                  onClick={() => setSelectedDurations(prev => ({ ...prev, [internship._id]: duration.key }))}
                                  className={`flex-1 text-center py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-[6px] transition-all ${
                                    isSelected
                                      ? "bg-primary text-white shadow-sm font-bold"
                                      : "text-[color:var(--text-secondary)] hover:text-[color:var(--text)]"
                                  }`}
                                >
                                  {getDurationLabel(duration)}
                                </button>
                              );
                            })}
                          </div>

                          {selectedDuration && (
                            <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-3 text-xs">
                              <div>
                                <span className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">Type</span>
                                <p className="font-semibold text-[color:var(--text)]">
                                  {isPaidDuration(selectedDuration) ? "Paid Internship" : "Unpaid Track"}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">Price</span>
                                <p className="font-semibold text-[color:var(--text)]">
                                  {getDurationPriceLabel(selectedDuration)}
                                </p>
                              </div>
                            </div>
                          )}

                          {selectedDuration && getRewardsText(selectedDuration) && (
                            <div className="mt-2 rounded-[8px] bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold text-center uppercase tracking-wide">
                              {getRewardsText(selectedDuration)}
                            </div>
                          )}
                        </div>

                        <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--border)] pt-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => setActiveInternship(internship)} className="flex-1">
                              Preview role
                            </Button>
                            <Link to={`/internship/${internship.slug}/${selectedKey}`} className="flex-[2]">
                              <Button variant="accent" className="w-full">
                                View {getDurationLabel(selectedDuration)} Plan
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
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
      >
        <InternshipPreviewPanel
          internship={activeInternship}
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
