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
            eyebrow="Live cohorts"
            title="Open internships organised like a serious product pipeline, not a random jobs board."
            description="Every role below is presented as a structured track. Browse the live list, open a modal for the full breakdown, and move into application from a cleaner workflow."
          />

          <div className="grid gap-4 xl:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Structured review flow",
                description: "Every application moves through clear states instead of disappearing after submission."
              },
              {
                icon: FileText,
                title: "Offer letters and tasks",
                description: "Selected students receive role-linked documents directly inside their dashboard."
              },
              {
                icon: ShieldCheck,
                title: "Public verification layer",
                description: "Completion certificates remain verifiable and professional for hiring use."
              }
            ].map((item, index) => (
              <RevealInView key={item.title} delay={index * 0.05}>
                <Card>
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="mt-5">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </RevealInView>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="navyan-card h-[176px] animate-pulse bg-white/40 dark:bg-white/5"
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
            <div className="space-y-4">
              {internships.map((internship, index) => (
                <RevealInView key={internship._id} delay={index * 0.03}>
                  <div className="navyan-card overflow-hidden p-0">
                    <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
                      <div className="relative min-h-[220px] border-b border-white/8 bg-[#0f1318] lg:min-h-full lg:border-b-0 lg:border-r">
                        {internship.coverImageUrl ? (
                          <img
                            src={internship.coverImageUrl}
                            alt={internship.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(212,168,95,0.16),transparent_56%),linear-gradient(180deg,#111418_0%,#171b21_100%)] px-6 text-center text-sm text-[#b7c0cc]">
                            Navyan internship cohort
                          </div>
                        )}
                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-primary/18 bg-[#0f1318]/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
                          <Sparkles className="h-3.5 w-3.5" />
                          Open now
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-5 px-5 py-5 md:px-6">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#b7c0cc]">
                                  {internship.role || "Internship track"}
                                </span>
                                <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#b7c0cc]">
                                  {internship.mode?.toUpperCase() || "REMOTE"}
                                </span>
                                {internship.openings ? (
                                  <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#b7c0cc]">
                                    {internship.openings} openings
                                  </span>
                                ) : null}
                              </div>

                              <div>
                                <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-[#f5f7fa]">
                                  {internship.title}
                                </h3>
                                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                                  {internship.shortDescription}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-[24px] border border-primary/15 bg-primary/10 px-4 py-4 xl:min-w-[230px]">
                              <div className="flex items-center gap-2 text-primary">
                                <WalletCards className="h-4 w-4" />
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                                  Duration model
                                </span>
                              </div>
                              <p className="mt-3 text-sm font-semibold text-[#825f25] dark:text-primary">
                                {(internship.durations || []).some((item) => item.isPaid || item.price > 0)
                                  ? "Free + paid tracks available"
                                  : "Free internship track"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {(internship.skillsRequired || []).slice(0, 6).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-black/8 bg-black/[0.03] px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            {(internship.durations || []).map((duration) => (
                              <div
                                key={duration.key}
                                className="rounded-[22px] border border-black/8 bg-black/[0.025] px-4 py-3 dark:border-white/8 dark:bg-[#101419]/94"
                              >
                                <p className="text-xs font-semibold text-slate-900 dark:text-[#f5f7fa]">
                                  {getDurationLabel(duration)}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#7e8794]">
                                  {duration.isPaid || duration.price > 0
                                    ? `Paid${duration.price ? ` • Rs ${duration.price}` : ""}`
                                    : "Free"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-black/8 pt-4 dark:border-white/8 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-slate-500 dark:text-[#7e8794]">
                            Open a preview to inspect the role, durations, benefits, and workflow before applying.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => setActiveInternship(internship)}>
                              Preview role
                            </Button>
                            <Link to={`/internships/${internship.slug}`}>
                              <Button>
                                Full page
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
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
              <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7e8794]">
                  Next step
                </p>
                <p className="mt-4 text-sm leading-7 text-[#b7c0cc]">
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
