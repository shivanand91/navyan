import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Code2,
  FileText,
  Globe2,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Stars,
  Users2,
  WalletCards,
  Trophy,
  Search,
  ExternalLink,
  Linkedin
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { ModalShell } from "@/components/premium/ModalShell";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";

const VISITOR_STORAGE_KEY = "navyan_visitor_id";
const durationFallbackLabels = {
  "4-weeks": "4 weeks",
  "3-months": "3 months",
  "6-months": "6 months"
};

const workflowSteps = [
  {
    step: "Step 1",
    title: "Apply Online",
    description: "Choose your internship duration, submit your application, and enter the review flow.",
    icon: FileText
  },
  {
    step: "Step 2",
    title: "Get Selected",
    description: "Our team reviews your application and moves selected students into the next stage.",
    icon: BadgeCheck
  },
  {
    step: "Step 3",
    title: "Start Internship",
    description: "Access your task flow, learning path, and guided execution inside one structured system.",
    icon: Rocket
  },
  {
    step: "Step 4",
    title: "Track Performance & Earn Rewards",
    description: "Complete tasks, maintain performance, unlock certificates, and qualify for rewards.",
    icon: Stars
  }
];

const programCards = [
  {
    duration: "4 Weeks",
    billing: "Paid",
    summary: "Basic learning, task execution, and verified certificate support.",
    points: [
      "Basic learning roadmap",
      "Structured tasks",
      "Completion certificate"
    ]
  },
  {
    duration: "3 Months",
    billing: "PAID",
    summary: "Live classes, coordinator support, and stronger real-world execution.",
    points: [
      "Live classes and support",
      "Coordinator-led flow",
      "Real work exposure"
    ]
  },
  {
    duration: "6 Months",
    billing: "PAID",
    summary: "Advanced projects, deeper mentorship, and stronger reward eligibility.",
    points: [
      "Advanced project work",
      "Longer mentorship cycle",
      "Rewards and recognition"
    ]
  }
];

const reasons = [
  {
    title: "Real Experience",
    description: "Students work through structured tasks and applied execution instead of passive learning.",
    icon: BriefcaseBusiness
  },
  {
    title: "Live Mentorship",
    description: "Guidance stays close to the work so students always know what to do next.",
    icon: Users2
  },
  {
    title: "Performance Tracking",
    description: "Applications, progress, submissions, and outcomes stay visible in one dashboard.",
    icon: Layers3
  },
  {
    title: "Rewards & Certificates",
    description: "Strong performers can unlock recognition, and every completed track stays verifiable.",
    icon: ShieldCheck
  },
  {
    title: "Simple Application Process",
    description: "The full journey is designed to stay clear, fast, and confidence-building from day one.",
    icon: Sparkles
  }
];

const testimonialCards = [
  {
    name: "Aayushi Singh",
    role: "Final-year engineering student",
    quote:
      "NAVYAN made the internship process feel clear and premium. I always knew my next step."
  },
  {
    name: "Rahul Verma",
    role: "Selected intern",
    quote:
      "The platform felt structured from application to certificate. It never looked like a basic portal."
  },
  {
    name: "Nikita Sharma",
    role: "Career-focused fresher",
    quote:
      "What I liked most was the clarity. Apply, get reviewed, work properly, and earn a real outcome."
  }
];

const faqData = [
  {
    q: "Who can apply for Navyan internships?",
    a: "Students, freshers, and early-career learners who want practical skill development and structured internship outcomes can apply."
  },
  {
    q: "Is the 4-week internship really free?",
    a: "Yes. The 4-week track is built as a free starting path for students who want practical exposure, task-based learning, and a completion certificate."
  },
  {
    q: "What is different in the paid programs?",
    a: "The 3-month and 6-month programs include more structure, stronger coordination, real work exposure, deeper mentorship, and reward-oriented performance tracking."
  },
  {
    q: "How do I know my application status?",
    a: "NAVYAN keeps the workflow structured so students can follow their review, selection, progress, submission, and certificate journey clearly."
  }
];



const getDurationLabel = (duration) =>
  duration?.label || durationFallbackLabels[duration?.key] || duration?.key;

const getHackathonExcerpt = (description) => {
  const normalized = String(description || "").trim().replace(/\s+/g, " ");
  if (normalized.length <= 160) {
    return normalized;
  }

  return `${normalized.slice(0, 157).trimEnd()}...`;
};

const normalizeExternalUrl = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `https://${normalized}`;
};

const getInitials = (name) => {
  if (!name) return "SK";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "SK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const renderCertificateCard = (cert, index) => {
  const initials = getInitials(cert.fullName);
  const durationLabel = durationFallbackLabels[cert.durationKey] || cert.durationKey || "Internship";

  return (
    <div
      key={`${cert._id}-${index}`}
      className="relative flex flex-col justify-between w-[320px] sm:w-[350px] shrink-0 rounded-[28px] border border-[#2897FF]/30 bg-white dark:bg-slate-900 p-6 shadow-md hover:shadow-lg transition whitespace-normal"
    >
      {/* Verified indicator in the top right */}
      <span className="absolute top-5 right-6 text-xs font-semibold tracking-wider text-[#2897FF] dark:text-[#4FA8FF] uppercase">
        Verified
      </span>

      {/* Main card info: Avatar + Names */}
      <div className="flex items-center gap-6 mt-4">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#2897FF]/35 bg-[#2897FF]/5 text-2xl font-bold uppercase text-[#2897FF] dark:text-[#4FA8FF] font-display">
          {initials}
        </div>

        {/* Text details */}
        <div className="space-y-1 overflow-hidden">
          <h4 className="font-display text-xl font-bold text-slate-900 dark:text-white truncate" title={cert.fullName}>
            {cert.fullName}
          </h4>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
            {cert.role}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {durationLabel}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <a
          href={`/verify-certificate?cid=${cert.certificateId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <div className="w-full py-3 border border-[#2897FF]/75 rounded-[16px] text-center text-[10px] sm:text-[11px] font-bold text-[#2897FF] hover:bg-[#2897FF]/10 dark:text-[#4FA8FF] dark:border-[#4FA8FF]/75 dark:hover:bg-[#4FA8FF]/10 transition uppercase tracking-wide">
            View Cert
          </div>
        </a>
        {cert.linkedinUrl ? (
          <a
            href={normalizeExternalUrl(cert.linkedinUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <div className="w-full py-3 border border-[#2897FF]/75 bg-[#2897FF]/5 rounded-[16px] text-center text-[10px] sm:text-[11px] font-bold text-[#2897FF] hover:bg-[#2897FF]/15 dark:text-[#4FA8FF] dark:border-[#4FA8FF]/75 dark:hover:bg-[#4FA8FF]/20 transition uppercase tracking-wide flex items-center justify-center gap-1">
              <Linkedin className="h-3 w-3 shrink-0" />
              <span>LinkedIn</span>
            </div>
          </a>
        ) : (
          <div className="w-full py-3 border border-slate-200 dark:border-slate-800 rounded-[16px] text-center text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900/40 select-none uppercase tracking-wide cursor-not-allowed flex items-center justify-center gap-1">
            <Linkedin className="h-3 w-3 shrink-0" />
            <span>No Link</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [internships, setInternships] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [activeHackathon, setActiveHackathon] = useState(null);
  const [publicCertificates, setPublicCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const faqItems = useMemo(
    () =>
      faqData.map((item, index) => ({
        value: `${index}`,
        trigger: item.q,
        content: item.a
      })),
    []
  );

  const openInternshipCount = internships.length;
  const featuredServices = services.slice(0, 3);
  const formattedVisitors = useMemo(
    () =>
      visitorStats?.uniqueVisitors
        ? new Intl.NumberFormat("en-IN").format(visitorStats.uniqueVisitors)
        : "—",
    [visitorStats]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [internshipsResponse, servicesResponse, hackathonsResponse, certificatesResponse] = await Promise.all([
          api.get("/internships"),
          api.get("/services"),
          api.get("/hackathons").catch(() => ({ data: { hackathons: [] } })),
          api.get("/certificates/public").catch(() => ({ data: { certificates: [] } }))
        ]);
        setInternships(internshipsResponse.data.internships || []);
        setServices(servicesResponse.data.services || []);
        setHackathons(hackathonsResponse.data.hackathons || []);
        setPublicCertificates(certificatesResponse.data.certificates || []);
      } catch (error) {
        console.error(error);
        setInternships([]);
        setServices([]);
        setHackathons([]);
        setPublicCertificates([]);
      } finally {
        setLoading(false);
        setServicesLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/certificates/public?search=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.certificates || []);
      } catch (error) {
        console.error("Error searching certificates:", error);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    let ignore = false;

    const getOrCreateVisitorId = () => {
      if (typeof window === "undefined") return "";

      const existingId = window.localStorage.getItem(VISITOR_STORAGE_KEY);
      if (existingId) {
        return existingId;
      }

      const createdId =
        typeof window.crypto?.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `navyan-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      window.localStorage.setItem(VISITOR_STORAGE_KEY, createdId);
      return createdId;
    };

    const trackVisitor = async () => {
      try {
        const visitorId = getOrCreateVisitorId();
        if (!visitorId) return;

        const { data } = await api.post("/analytics/visit", {
          visitorId,
          path: window.location.pathname,
          referrer: document.referrer
        });

        if (!ignore) {
          setVisitorStats(data.stats || null);
        }
      } catch (error) {
        try {
          const { data } = await api.get("/analytics/public");
          if (!ignore) {
            setVisitorStats(data.stats || null);
          }
        } catch {
          if (!ignore) {
            setVisitorStats(null);
          }
        }
      }
    };

    trackVisitor();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="pb-10">
      {/* Hackathon Marquee */}
      {hackathons.length > 0 && (
        <div className="bg-[#6D28D9] dark:bg-[#8B5CF6] text-white overflow-hidden py-2 font-display text-xs font-semibold uppercase tracking-wider relative z-20 border-b border-border dark:border-[#2a2a36]">
          <div className="animate-marquee whitespace-nowrap flex gap-12">
            {Array(4).fill(null).map((_, i) => (
              <span key={i} className="inline-flex gap-12">
                {hackathons.map((h) => (
                  <span key={h._id} className="inline-flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    🚀 HACKATHON LIVE: {h.title} — Team size limit: {h.minTeamSize}-{h.maxTeamSize} person{h.maxTeamSize > 1 ? "s" : ""}! Click below to register!
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}
      <section className="navyan-section overflow-hidden px-4 pb-8 pt-8 md:px-6 md:pt-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-8">
            <RevealInView>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-border bg-backgroundSecondary text-textSecondary">
                <Sparkles className="h-3 w-3 text-accent" />
                <span>Internships &amp; IT Services Platform</span>
              </div>
            </RevealInView>

            <RevealInView delay={0.04}>
              <div className="space-y-5">
                <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-textPrimary sm:text-5xl lg:text-6xl">
                  Outcome-Driven Learning &amp; Digital Execution
                </h1>
                <p className="max-w-2xl text-base leading-8 text-textSecondary md:text-lg">
                  We run structured, task-based internships for freshers and students, and operate as a product development studio for startups and businesses.
                </p>
              </div>
            </RevealInView>

            <RevealInView delay={0.08}>
              <div className="flex flex-wrap gap-3">
                <Link to="/internships">
                  <Button variant="accent" size="lg">
                    Explore Internships
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="outline" size="lg">
                    Start a Project
                  </Button>
                </Link>
              </div>
            </RevealInView>

            <RevealInView delay={0.12}>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Open internships",
                    value: loading ? "Loading..." : `${openInternshipCount} live`
                  },
                  {
                    label: "Tracked visitors",
                    value: visitorStats ? formattedVisitors : "Loading..."
                  },
                  {
                    label: "Platform promise",
                    value: "Simple, clear, verified"
                  }
                ].map((item) => (
                  <div key={item.label} className="navyan-card px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-textPrimary">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </RevealInView>
          </div>

          <RevealInView delay={0.06}>
            <div className="navyan-panel relative overflow-hidden p-6 md:p-7">
              <div className="relative space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="navyan-pill">Student + laptop workflow</div>
                    <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-textPrimary md:text-[2rem]">
                      Clear steps, real mentorship, and visible progress.
                    </h2>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[10px] border border-primary/15 bg-primary/10 text-primary">
                    <Code2 className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="navyan-card px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-primary/15 bg-primary/10 text-primary">
                        <Users2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-textPrimary">
                          Student-ready flow
                        </p>
                        <p className="text-xs text-textMuted">
                          Simple apply experience
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="navyan-card px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-accent/30 bg-accent/10 text-accent">
                        <WalletCards className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-textPrimary">
                          Free + paid tracks
                        </p>
                        <p className="text-xs text-textMuted">
                          4 weeks, 3 months, 6 months
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-[0_8px_30px_rgba(20,20,15,0.06)] dark:shadow-none">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">
                        Live workflow preview
                      </p>
                      <p className="mt-2 text-sm font-semibold text-textPrimary">
                        What students see after applying
                      </p>
                    </div>
                    <div className="rounded-full border border-success/20 bg-success/12 px-3 py-1 text-[11px] font-semibold text-success">
                      Active
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      "Application submitted",
                      "Under review by Navyan",
                      "Internship started with tasks",
                      "Performance tracked and certificate unlocked"
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-[12px] border border-[color:var(--border)] bg-black/[0.015] dark:bg-white/[0.02] px-4 py-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-textPrimary">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealInView>
        </div>
      </section>

      {/* Hackathons Showcase */}
      {hackathons.length > 0 && (
        <section className="navyan-section px-4 md:px-6 bg-backgroundSecondary/30 dark:bg-[#16161d]/20 border-y border-border">
          <div className="mx-auto max-w-7xl space-y-8">
            <SectionHeading
              eyebrow="Hackathons"
              title="Live Challenges"
              description="Latest team challenges and updates."
            />
            <div className="grid gap-6">
              {hackathons.map((hackathon, idx) => (
                <RevealInView key={hackathon._id} delay={idx * 0.05}>
                  <div className="navyan-card group grid overflow-hidden rounded-[30px] border border-[#2897FF]/30 bg-[#f8fafc] p-4 dark:border-[#2897FF]/20 dark:bg-[#0f172a] lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch lg:gap-6 lg:p-5">
                    <div className="relative overflow-hidden rounded-[24px] border border-[#2897FF]/25 bg-slate-200 dark:bg-slate-950">
                      {hackathon.coverImageUrl ? (
                        <img
                          src={hackathon.coverImageUrl}
                          alt={hackathon.title}
                          className="aspect-[16/9] h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] lg:aspect-auto lg:min-h-[360px]"
                        />
                      ) : (
                        <div className="flex aspect-[16/9] h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400 lg:min-h-[360px]">
                          No cover image
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-full border border-[#2897FF]/40 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#176CDE] dark:bg-[#0f172a]/85 dark:text-[#4FA8FF]">
                        Live
                      </div>
                    </div>
                    <div className="flex min-h-full flex-col justify-between px-1 py-2 lg:px-2">
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#176CDE] dark:text-[#2897FF]">
                            {hackathon.tag || "Hackathon"}
                          </p>
                          <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white md:text-2xl">
                            {hackathon.title}
                          </h3>
                          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {getHackathonExcerpt(hackathon.description)}
                          </p>
                        </div>

                        <div className="rounded-[20px] border border-[#2897FF]/30 bg-white/70 px-4 py-3 dark:bg-slate-900/50">
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#176CDE] dark:text-[#2897FF]">
                            Team size
                          </p>
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                            {hackathon.minTeamSize === hackathon.maxTeamSize ? `${hackathon.minTeamSize} member(s)` : `${hackathon.minTeamSize} to ${hackathon.maxTeamSize} members`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 rounded-[20px] border-[#2897FF]/60 bg-transparent text-slate-900 hover:bg-[#2897FF]/10 hover:text-slate-950 dark:text-white dark:hover:bg-white/5 dark:hover:text-white"
                          onClick={() => setActiveHackathon(hackathon)}
                        >
                          View Details
                        </Button>
                        {hackathon.registrationLink ? (
                          <a
                            href={normalizeExternalUrl(hackathon.registrationLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button
                              variant="outline"
                              className="h-12 w-full rounded-[20px] border-[#2897FF]/60 bg-transparent text-slate-900 hover:bg-[#2897FF]/10 hover:text-slate-950 dark:text-white dark:hover:bg-white/5 dark:hover:text-white"
                            >
                              Open Form
                            </Button>
                          </a>
                        ) : (
                          <Button
                            disabled
                            variant="outline"
                            className="h-12 rounded-[20px] border-[#2897FF]/30 bg-transparent text-slate-400"
                          >
                            Closed
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </RevealInView>
              ))}
            </div>
          </div>
        </section>
      )}

      <ModalShell
        open={Boolean(activeHackathon)}
        onClose={() => setActiveHackathon(null)}
        title={activeHackathon?.title}
        description="Review the complete hackathon details here, then open the registration form in a new tab."
      >
        {activeHackathon ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[24px] border border-border bg-backgroundSecondary">
              {activeHackathon.coverImageUrl ? (
                <img
                  src={activeHackathon.coverImageUrl}
                  alt={activeHackathon.title}
                  className="aspect-[16/8] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/8] items-center justify-center bg-slate-900 text-sm text-slate-300">
                  No cover image
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-border bg-backgroundSecondary/70 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">
                  Tag
                </p>
                <p className="mt-2 text-sm font-semibold text-textPrimary">
                  {activeHackathon.tag || "Hackathon"}
                </p>
              </div>
              <div className="rounded-[20px] border border-border bg-backgroundSecondary/70 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">
                  Team size
                </p>
                <p className="mt-2 text-sm font-semibold text-textPrimary">
                  {activeHackathon.minTeamSize === activeHackathon.maxTeamSize
                    ? `${activeHackathon.minTeamSize} member(s)`
                    : `${activeHackathon.minTeamSize} to ${activeHackathon.maxTeamSize} members`}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-[color:var(--card)] p-5 md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">
                Hackathon details
              </p>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-textSecondary">
                {activeHackathon.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {activeHackathon.registrationLink ? (
                <a
                  href={normalizeExternalUrl(activeHackathon.registrationLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:flex-1"
                >
                  <Button variant="accent" className="w-full justify-center">
                    Open Registration Form
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Button disabled variant="outline" className="sm:flex-1">
                  Registrations Closed
                </Button>
              )}
              <Button type="button" variant="outline" className="sm:flex-1" onClick={() => setActiveHackathon(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </ModalShell>

      <section id="how-navyan-works" className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="How Navyan Works"
            title="A simple 4-step internship flow."
            description="Students should instantly understand what Navyan is, what they need to do, and how they can apply."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowSteps.map((item, index) => (
              <RevealInView key={item.title} delay={index * 0.05}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-primary/15 bg-primary/10 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">
                        {item.step}
                      </span>
                    </div>
                    <CardTitle className="mt-5">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </RevealInView>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Internship Programs"
            title="Programs for different levels of commitment."
            description="Start with a free program or move into paid tracks for deeper support, stronger execution, and bigger outcomes."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {programCards.map((program, index) => (
              <RevealInView key={program.duration} delay={index * 0.06}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-primary/15 bg-primary/10 text-primary">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          program.billing === "FREE"
                            ? "border border-success/20 bg-success/12 text-success"
                            : "border border-primary/20 bg-primary/10 text-primary"
                        }`}
                      >
                        {program.billing}
                      </span>
                    </div>
                    <CardTitle className="mt-5">{program.duration}</CardTitle>
                    <CardDescription>{program.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {program.points.map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                           <p className="text-sm leading-7 text-textSecondary">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Link to="/internships" className="mt-5 inline-flex">
                      <Button variant={program.billing === "FREE" ? "outline" : "solid"}>
                        Apply Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </RevealInView>
            ))}
          </div>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[24px] border border-primary/20 bg-gradient-to-br from-primary/15 via-[color:var(--card)] to-amber-400/15 p-6 md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
            <div><span className="navyan-pill">Share & Earn</span><h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-textPrimary md:text-4xl">Share internships. Earn money.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-textSecondary">Help your friends discover Navyan internships and earn rewards when they successfully join through your unique link.</p><Link to="/student/share-and-earn" className="mt-6 inline-flex"><Button variant="accent">Start sharing <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div>
            <div className="grid grid-cols-3 gap-3">{[["₹10", "4 Weeks"], ["₹50", "3 Months"], ["₹100", "6 Months"]].map(([amount, duration]) => <div key={duration} className="rounded-2xl border border-primary/15 bg-[color:var(--card)] p-4 text-center shadow-sm"><p className="font-display text-2xl font-bold text-primary">{amount}</p><p className="mt-2 text-xs font-semibold text-textSecondary">{duration}</p></div>)}</div>
          </div><p className="mt-6 text-xs text-textMuted">Rewards are credited only for eligible successful enrollments and are subject to Navyan's Share & Earn terms.</p>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Live Internships"
            title="Explore currently open internships."
          />

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="navyan-card h-[430px] animate-pulse bg-white/40 dark:bg-white/5"
                />
              ))}
            </div>
          ) : internships.length === 0 ? (
            <div className="navyan-card px-6 py-12 text-center">
              <p className="font-display text-2xl font-semibold text-textPrimary">
                No live internships at the moment.
              </p>
              <p className="mt-3 text-sm text-textSecondary">
                New cohorts will appear here as soon as the admin publishes them.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {internships.slice(0, 3).map((internship, index) => (
                <RevealInView key={internship._id} delay={index * 0.05}>
                  <div className="navyan-card flex h-full flex-col overflow-hidden p-0">
                    <div className="relative aspect-video overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--bg-secondary)]">
                      {internship.coverImageUrl ? (
                        <img
                          src={internship.coverImageUrl}
                          alt={internship.title}
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-textMuted">
                          Navyan internship live
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-[8px] border border-primary/18 bg-[color:var(--card)]/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
                        {internship.mode?.toUpperCase() || "REMOTE"}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col px-5 py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--bg-secondary)] px-3 py-1 text-[11px] font-medium text-textSecondary">
                          {internship.role || "Internship track"}
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

                      <div className="mt-4 grid gap-2">
                        {(internship.durations || []).slice(0, 3).map((duration) => (
                          <div
                            key={duration.key}
                            className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/50 px-4 py-3"
                          >
                            <p className="text-xs font-semibold text-textPrimary">
                              {getDurationLabel(duration)}
                            </p>
                            <p className="mt-1 text-[11px] text-textMuted">
                              {duration.isPaid ? "Paid track" : "Free track"}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto border-t border-[color:var(--border)] pt-4">
                        <Link to={`/internships/${internship.slug}`}>
                          <Button className="w-full">
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </RevealInView>
              ))}
            </div>
          )}

          {internships.length > 3 ? (
            <div className="flex justify-center">
              <Link to="/internships">
                <Button variant="outline" size="lg">
                  View all internships
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Featured Services"
            title="Professional IT & Development Services."
          />

          {servicesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="navyan-card h-[460px] animate-pulse bg-white/40 dark:bg-white/5"
                />
              ))}
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="navyan-card px-6 py-12 text-center">
              <p className="font-display text-2xl font-semibold text-textPrimary">
                No services are live right now.
              </p>
              <p className="mt-3 text-sm text-textSecondary">
                The featured services preview will appear once the admin publishes offerings.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {featuredServices.map((service) => (
                  <Card
                    key={service._id}
                    className="flex h-full min-h-[460px] flex-col overflow-hidden p-0"
                  >
                    <div className="relative aspect-video overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--card)]">
                      {service.featureImageUrl ? (
                        <img
                          src={service.featureImageUrl}
                          alt={service.title}
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-textSecondary">
                          Navyan service preview
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-[8px] border border-primary/18 bg-[color:var(--card)]/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
                        {service.category || "Service"}
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle>{service.title}</CardTitle>
                      <CardDescription>{service.shortDescription}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col justify-between">
                      <div className="space-y-3">
                        {(service.highlights || []).slice(0, 3).map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                            <p className="text-sm leading-7 text-textSecondary">
                              {item}
                            </p>
                          </div>
                        ))}
                        {service.description ? (
                          <p
                            className="whitespace-pre-line text-sm leading-7 text-textSecondary"
                            style={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 3,
                              overflow: "hidden"
                            }}
                          >
                            {service.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--border)] pt-4 sm:flex-row">
                        <Link
                          to={`/contact?mode=inquiry&service=${encodeURIComponent(service.title)}&serviceId=${service._id}`}
                          className="sm:flex-1"
                        >
                          <Button className="w-full">
                            Start a Project
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to="/services" className="sm:flex-1">
                          <Button variant="outline" className="w-full">
                            View all services
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <Link to="/services">
                  <Button variant="outline" size="lg">
                    View all services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Why Choose Navyan"
            title="Why students choose NAVYAN."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {reasons.map((item, index) => (
              <RevealInView key={item.title} delay={index * 0.04}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-primary/15 bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="mt-5">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </RevealInView>
            ))}
          </div>
        </div>
      </section>



      <section id="verification" className="navyan-section px-4 md:px-6 bg-backgroundSecondary/20 py-16 border-y border-border">
        <div className="mx-auto max-w-7xl space-y-10">
          <SectionHeading
            eyebrow="Verification Desk"
            title="Verified Internship Graduates"
            description="Navyan issues tamper-proof, fully verifiable certificates. Search by student name or certificate ID to instantly check their credentials."
          />

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative rounded-[20px] border border-border bg-backgroundSecondary shadow-sm focus-within:border-primary/50 transition">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-textMuted" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search graduate name or Certificate ID (e.g. NAV-CERT-2026-MOCK01)..."
                className="block w-full rounded-[20px] bg-transparent py-4 pl-12 pr-4 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-semibold text-textMuted hover:text-textPrimary"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Content */}
          {searchQuery.trim() ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-textMuted">
                  {searchLoading ? "Searching..." : `Search Results (${searchResults.length})`}
                </h3>
              </div>

              {searchLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-center">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-[320px] sm:w-[350px] h-52 animate-pulse bg-[#2897FF]/5 rounded-[28px] border border-border"
                    />
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="navyan-card py-12 text-center max-w-md mx-auto bg-white dark:bg-slate-900 border border-border">
                  <p className="font-display text-lg font-semibold text-textPrimary">
                    No verified graduate found
                  </p>
                  <p className="mt-2 text-sm text-textSecondary">
                    We couldn't find any certificates matching "{searchQuery}". Please verify the name spelling or ID.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-center">
                  {searchResults.map((cert, index) => renderCertificateCard(cert, index))}
                </div>
              )}
            </div>
          ) : (
            /* Auto-scrolling Marquee */
            <div className="relative w-full overflow-hidden py-4">
              {/* Fade gradients on edges for premium visual finish */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

              {publicCertificates.length === 0 ? (
                <div className="navyan-card py-12 text-center max-w-md mx-auto bg-white dark:bg-slate-900 border border-border">
                  <p className="font-display text-lg font-semibold text-textPrimary">
                    No completed certificates yet
                  </p>
                  <p className="mt-2 text-sm text-textSecondary">
                    As soon as students graduate, their credentials will auto-scroll here.
                  </p>
                </div>
              ) : (
                <div className="flex gap-6 animate-marquee whitespace-nowrap">
                  {/* We double the array to allow seamless looping animation */}
                  {[...publicCertificates, ...publicCertificates].map((cert, index) => renderCertificateCard(cert, index))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section id="faq" className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions students ask before applying."
            description="Short, clear answers before you apply."
          />

          <div className="navyan-panel p-3 md:p-4">
            <Accordion items={faqItems} defaultValue="0" className="space-y-4" />
          </div>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="navyan-panel relative overflow-hidden px-6 py-8 md:px-8 md:py-10 lg:px-10">
            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div className="space-y-5">
                <div className="navyan-pill">Final CTA</div>
                <div className="space-y-4">
                  <h2 className="max-w-3xl font-display text-3xl font-semibold tracking-[-0.035em] text-textPrimary md:text-4xl lg:text-[2.8rem]">
                    Start with the path that fits your current stage.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-textSecondary md:text-lg">
                    Apply for internships, build confidence with courses, and move through a platform
                    that feels structured from application to completion.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    "4-week free starter internship",
                    "3 & 6-month deeper paid programs",
                    "Verified certificates and tracked progress"
                  ].map((point) => (
                    <div
                      key={point}
                      className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-4 text-sm font-medium text-textSecondary"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              <div className="navyan-card px-5 py-5 md:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textMuted">
                  Next step
                </p>
                <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-textPrimary">
                  Pick one action and move forward.
                </p>
                <p className="mt-3 text-sm leading-7 text-textSecondary">
                  Browse courses if you want to build skills first, or go straight into internships
                  if you are ready to apply now.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link to="/internships" className="sm:flex-1 lg:flex-none">
                    <Button size="lg" className="w-full">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/courses" className="sm:flex-1 lg:flex-none">
                    <Button variant="outline" size="lg" className="w-full">
                      Browse Courses
                      <BookOpen className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <a
                  href="https://www.navyan.online"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-textSecondary transition hover:border-primary/30 hover:text-primary"
                >
                  navyan.online
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
