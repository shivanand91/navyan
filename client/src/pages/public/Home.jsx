import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Blocks,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  Globe2,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Stars,
  Users2
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import HeroScene from "@/components/premium/HeroScene";
import { MetricCard } from "@/components/premium/MetricCard";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";
import { TestimonialCarousel } from "@/components/premium/TestimonialCarousel";

const VISITOR_STORAGE_KEY = "navyan_visitor_id";

const baseTrustMetrics = [
  { label: "Structured workflows", value: "8+", hint: "Lifecycle", icon: Layers3, tone: "gold" },
  { label: "Public verification", value: "100%", hint: "Trust", icon: ShieldCheck, tone: "cyan" },
  { label: "Internship formats", value: "3", hint: "Programs", icon: BriefcaseBusiness, tone: "violet" },
  { label: "Delivery tracks", value: "2", hint: "Talent + Studio", icon: Building2, tone: "success" }
];

const services = [
  {
    title: "Startup MVP Engineering",
    description: "From concept to launch-ready product with full-stack execution and founder-speed iteration.",
    icon: Rocket
  },
  {
    title: "Premium Web Platforms",
    description: "Marketing sites and web apps that feel refined, fast, and distinctly product-led.",
    icon: Blocks
  },
  {
    title: "Internship Operations",
    description: "Automated student journeys with offer letters, task assignment, submissions, and certificates.",
    icon: FileText
  },
  {
    title: "Design Systems",
    description: "Sharp interface systems with visual hierarchy, motion, and consistent interaction logic.",
    icon: Sparkles
  }
];

const studentSignals = [
  "One profile powers every application and document.",
  "Offer letters and task briefs appear automatically after selection.",
  "Students track progress, submission windows, and certificates from one calm dashboard.",
  "Certificate verification is public, permanent, and brand-safe."
];

const durationTracks = [
  {
    duration: "4 Weeks",
    label: "Fast practical start",
    title: "Project-based learning with a verified internship experience.",
    description:
      "A compact track for students who want hands-on execution without waiting months to see progress.",
    accentLineClass: "from-primary via-primary/40 to-transparent",
    badgeClass: "border-primary/20 bg-primary/10 text-primary",
    featureTone: "text-primary",
    outcomeTone: "border-primary/15 bg-primary/10 dark:bg-primary/10",
    features: [
      "Project-based learning with structured task execution.",
      "A verified Navyan internship workflow from start to finish.",
      "Completion certificate after successful internship completion."
    ],
    outcome: "Ideal for students who want skill momentum, clarity, and a strong first internship credential."
  },
  {
    duration: "3 Months",
    label: "Most balanced track",
    title: "Real-world problem solving with deeper review, rewards, and credibility.",
    description:
      "A stronger internship format for students who want more than guided tasks and want to work closer to execution reality.",
    accentLineClass: "from-secondary via-secondary/45 to-transparent",
    badgeClass: "border-secondary/20 bg-secondary/10 text-secondary",
    featureTone: "text-secondary",
    outcomeTone: "border-secondary/15 bg-secondary/10 dark:bg-secondary/10",
    features: [
      "Work on real-world problem statements with execution pressure.",
      "Completion certificate after successful delivery and evaluation.",
      "Top performers may receive swags and exciting gifts.",
      "Future letter of recommendation support for strong performers."
    ],
    outcome: "Best for students who want stronger portfolio proof, visible performance feedback, and brand-backed recognition."
  },
  {
    duration: "6 Months",
    label: "Deepest growth path",
    title: "Longer ownership, stronger outcomes, and the most serious performance rewards.",
    description:
      "The long-duration track is for students who want more depth, more responsibility, and a higher-trust internship arc.",
    accentLineClass: "from-success via-success/45 to-transparent",
    badgeClass: "border-success/20 bg-success/10 text-success",
    featureTone: "text-success",
    outcomeTone: "border-success/15 bg-success/10 dark:bg-success/10",
    features: [
      "Includes everything available in the 3-month track.",
      "Deeper exposure to longer execution cycles and delivery consistency.",
      "Swags and gifts for strong performers.",
      "Letter of recommendation support for standout candidates."
    ],
    outcome: "Designed for students who want long-term growth, stronger discipline, and a premium internship story."
  }
];

const faqs = [
  {
    q: "Is Navyan only an internship portal?",
    a: "No. Navyan is a dual-engine platform: a structured internship system for students and a premium engineering/product studio for founders and companies."
  },
  {
    q: "What makes the internship flow different?",
    a: "The workflow is lifecycle-driven. Students move from application to selection, offer letter, task assignment, submission, review, and verified certificate in one place."
  },
  {
    q: "Can clients use Navyan for product development?",
    a: "Yes. The platform also serves founders and brands looking for website development, web apps, UI systems, and startup MVP execution."
  },
  {
    q: "How are certificates trusted publicly?",
    a: "Each certificate has a unique ID and public verification route, so hiring teams or institutions can confirm authenticity directly on the Navyan website."
  }
];

const testimonials = [
  {
    name: "Aayushi Singh",
    role: "Final-year engineering student",
    quote:
      "The experience felt like a real product, not a training portal. I always knew my status, deadlines, and documents without chasing anyone."
  },
  {
    name: "Founder, early-stage SaaS",
    role: "Startup client",
    quote:
      "Navyan blended speed with polish. The product direction, interface quality, and execution discipline felt far above a generic agency workflow."
  },
  {
    name: "Rahul Verma",
    role: "Selected intern",
    quote:
      "The dashboard made the internship feel serious and motivating. Offer letter, project brief, and certificate all stayed organized in one place."
  }
];

export default function Home() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState(null);

  const faqItems = useMemo(
    () =>
      faqs.map((item, index) => ({
        value: `${index}`,
        trigger: item.q,
        content: item.a
      })),
    []
  );

  const trustMetrics = useMemo(() => {
    const formattedVisitors = new Intl.NumberFormat("en-IN").format(
      visitorStats?.uniqueVisitors || 0
    );

    return [
      {
        label: "Tracked visitors",
        value: visitorStats ? formattedVisitors : "…",
        hint: "Live",
        icon: Globe2,
        tone: "gold"
      },
      ...baseTrustMetrics
    ];
  }, [visitorStats]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/internships");
        setInternships((data.internships || []).slice(0, 3));
      } catch {
        setInternships([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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
    <div>
      <section className="navyan-section overflow-hidden px-4 pb-10 pt-10 md:px-6 md:pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative z-10 space-y-8">
            <RevealInView>
              <div className="navyan-pill">Intelligent internships and product execution</div>
            </RevealInView>

            <RevealInView delay={0.05}>
              <div className="space-y-5">
                <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-slate-950 dark:text-[#f5f7fa] sm:text-6xl lg:text-7xl">
                  A premium platform for ambitious engineers and serious startups.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-[#b7c0cc] md:text-lg">
                  Navyan combines the clarity of a modern knowledge product with the depth of a
                  dark-premium SaaS interface. Students explore structured internships. Founders
                  ship digital products with a studio that feels built for the AI era.
                </p>
              </div>
            </RevealInView>

            <RevealInView delay={0.1}>
              <div className="flex flex-wrap gap-3">
                <Link to="/internships">
                  <Button size="lg">
                    Explore internships
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="outline" size="lg">
                    Build with Navyan
                  </Button>
                </Link>
                <Link to="/verify-certificate">
                  <Button variant="ghost" size="lg">
                    Verify certificate
                  </Button>
                </Link>
              </div>
            </RevealInView>

            <RevealInView delay={0.15}>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Fast applications", value: "Profile-first workflow" },
                  { label: "Premium delivery", value: "Structured, product-grade execution" },
                  { label: "Public trust", value: "Verification-ready documents" }
                ].map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-black/8 bg-white/65 px-4 py-4 dark:border-white/8 dark:bg-white/5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-[#f5f7fa]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </RevealInView>
          </div>

          <RevealInView delay={0.08} className="relative min-h-[560px]">
            <div className="navyan-grid-mask" />
            <div className="navyan-spotlight left-[12%] top-[12%] h-48 w-48" />
            <div className="navyan-spotlight bottom-[18%] right-[10%] h-56 w-56" />
            <HeroScene className="absolute inset-0" />

            <div className="relative z-10 grid h-full gap-4 pt-12 md:grid-cols-[0.58fr_0.42fr]">
              <div className="navyan-hero-panel p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#7e8794]">
                      Student view
                    </p>
                    <p className="mt-2 font-display text-xl font-semibold text-[#f5f7fa]">
                      Full-stack engineering internship
                    </p>
                  </div>
                  <span className="rounded-full border border-success/20 bg-success/12 px-3 py-1 text-[11px] font-medium text-success">
                    Selection live
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    { stage: "Profile completed", meta: "92% strength", active: true },
                    { stage: "Application under review", meta: "3-month cohort", active: true },
                    { stage: "Offer letter generated", meta: "Auto-issued", active: false },
                    { stage: "Final certificate unlocked", meta: "Publicly verifiable", active: false }
                  ].map((item) => (
                    <div
                      key={item.stage}
                      className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/6 px-4 py-3"
                    >
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${item.active ? "bg-primary shadow-[0_0_18px_rgba(212,168,95,0.75)]" : "bg-white/15"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#f5f7fa]">{item.stage}</p>
                        <p className="text-xs text-[#7e8794]">{item.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-10 md:pt-24">
                <div className="navyan-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                    Studio pipeline
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Discovery", "Aligned"],
                      ["Interface system", "In progress"],
                      ["Build sprint", "Queued"]
                    ].map(([label, state]) => (
                      <div key={label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-[#f5f7fa]">
                          {label}
                        </span>
                        <span className="text-xs text-[#7e8794]">{state}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="navyan-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                    Trust signal
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-[#f5f7fa]">
                    Every certificate stays verifiable from the public site.
                  </p>
                  <Link
                    to="/verify-certificate"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Open verification
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </RevealInView>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Core system"
            title="A product stack built for trust, progression, and premium execution."
            description="Navyan is not a brochure site. It is a modern internship lifecycle platform and a premium service workflow in one connected interface."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {trustMetrics.map((item, index) => (
              <RevealInView key={item.label} delay={index * 0.05}>
                <MetricCard {...item} />
              </RevealInView>
            ))}
          </div>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Service engine"
            title="A startup-grade product studio, layered into the same premium experience."
            description="Founders and brands use Navyan for websites, web apps, UI systems, and MVPs. The visual system stays consistent whether the user is a student or a client."
            action={
              <Link to="/services">
                <Button variant="outline">
                  View services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => (
              <RevealInView key={service.title} delay={index * 0.04}>
                <Card>
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                      <service.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="mt-5">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                </Card>
              </RevealInView>
            ))}
          </div>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Internship lifecycle"
              title="Clear steps, calm decisions, and dashboards that reward progress."
              description="The workflow is engineered to reduce confusion, improve trust, and keep students engaged through visible milestones."
            />
            <div className="space-y-4">
              {[
                {
                  title: "Profile-first applications",
                  description: "Students fill core information once, then apply fast with duration and motivation."
                },
                {
                  title: "Automated documents",
                  description: "Offer letters, task assignment, and certificates are generated as workflow states change."
                },
                {
                  title: "Submission intelligence",
                  description: "Progress tracking, pending windows, and revision-ready submissions stay centralized."
                }
              ].map((item, index) => (
                <RevealInView key={item.title} delay={index * 0.05}>
                  <div className="navyan-card px-5 py-5">
                    <p className="font-display text-xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                      {item.description}
                    </p>
                  </div>
                </RevealInView>
              ))}
            </div>
          </div>

          <RevealInView className="navyan-panel overflow-hidden p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#7e8794]">
                  Dashboard preview
                </p>
                <h3 className="mt-3 font-display text-3xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  Students always know what happens next.
                </h3>
              </div>
              <div className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                Progress-aware UX
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[0.52fr_0.48fr]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-[#101419]/92 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#f5f7fa]">Internship readiness</p>
                      <p className="text-xs text-[#7e8794]">Profile strength and active momentum</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-3xl font-semibold text-primary">92%</p>
                      <p className="text-[11px] text-[#7e8794]">Complete</p>
                    </div>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/6">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-[#101419]/92 p-5">
                  <p className="text-sm font-semibold text-[#f5f7fa]">Timeline</p>
                  <div className="mt-5 space-y-4">
                    {[
                      ["Application sent", "Completed"],
                      ["Review in progress", "Current"],
                      ["Selection + offer letter", "Next"],
                      ["Task completion + submission", "Upcoming"]
                    ].map(([label, meta], index) => (
                      <div key={label} className="flex gap-3">
                        <div className="mt-1 flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full ${index < 2 ? "bg-primary" : "bg-white/12"}`} />
                          {index < 3 ? <div className="mt-1 h-10 w-px bg-white/8" /> : null}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#f5f7fa]">{label}</p>
                          <p className="text-xs text-[#7e8794]">{meta}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="navyan-card p-5">
                  <p className="text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                    Why students stay engaged
                  </p>
                  <div className="mt-4 space-y-3">
                    {studentSignals.map((signal) => (
                      <div key={signal} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                        <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">{signal}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="navyan-card p-5">
                  <p className="text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                    Reward cues without noise
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { title: "Offer unlocked", icon: BadgeCheck, tone: "text-primary" },
                      { title: "Submission pending", icon: Clock3, tone: "text-warning" },
                      { title: "Certificate ready", icon: Stars, tone: "text-success" },
                      { title: "Next role matched", icon: Users2, tone: "text-accent" }
                    ].map((item) => (
                      <div key={item.title} className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                        <item.icon className={`h-4 w-4 ${item.tone}`} />
                        <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                          {item.title}
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

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Duration tracks"
            title="Choose the internship depth that matches your ambition."
            description="Every Navyan duration is verified and outcome-driven. The difference is how deeply you work, how much exposure you get, and what performance rewards become possible."
          />

          <div className="grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
            <RevealInView className="navyan-panel p-6">
              <p className="navyan-pill">What every track includes</p>
              <h3 className="mt-5 font-display text-3xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                Verified internships with clear outcomes and visible progress.
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Verified internship record",
                    description: "Every selected student moves through a structured workflow with status visibility and document support.",
                    icon: ShieldCheck,
                    tone: "text-primary"
                  },
                  {
                    title: "Task-based learning",
                    description: "Students work against defined project or problem statements instead of vague internship promises.",
                    icon: Code2,
                    tone: "text-secondary"
                  },
                  {
                    title: "Completion-backed credibility",
                    description: "Certificates and performance outcomes stay tied to actual execution, not just enrollment.",
                    icon: FileText,
                    tone: "text-success"
                  }
                ].map((item) => (
                  <div key={item.title} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                    <item.icon className={`h-4 w-4 ${item.tone}`} />
                    <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </RevealInView>

              <div className="grid gap-4 lg:grid-cols-3">
              {durationTracks.map((track, index) => (
                <RevealInView key={track.duration} delay={index * 0.05} className="h-full">
                  <div className="navyan-card h-full p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
                    <div className={`mb-6 h-px w-full bg-gradient-to-r ${track.accentLineClass}`} />

                    <div className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-[#8c96a3]">
                            {track.label}
                          </p>
                          <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-[#f5f7fa]">
                            {track.duration}
                          </h3>
                        </div>
                        <div className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${track.badgeClass}`}>
                          Verified
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <p className="text-lg font-semibold leading-8 text-slate-950 dark:text-[#f5f7fa]">
                          {track.title}
                        </p>
                        <p className="text-sm leading-7 text-slate-700 dark:text-[#c7cfdb]">
                          {track.description}
                        </p>
                      </div>

                      <div className="mt-6 flex-1 space-y-3">
                        {track.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <BadgeCheck className={`mt-1 h-4 w-4 shrink-0 ${track.featureTone}`} />
                            <p className="text-sm leading-7 text-slate-800 dark:text-[#dbe2ec]">
                              {feature}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className={`mt-6 rounded-[22px] border p-4 ${track.outcomeTone}`}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-[#8c96a3]">
                          Why choose this
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-800 dark:text-[#dbe2ec]">
                          {track.outcome}
                        </p>
                      </div>
                    </div>
                  </div>
                </RevealInView>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Open roles"
            title="Current internship programs with a premium, structured workflow."
            description="Every listing is designed to feel trustworthy, clear, and actionable, with duration, responsibilities, and document automation built in."
            action={
              <Link to="/internships">
                <Button variant="outline">Browse all roles</Button>
              </Link>
            }
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="navyan-card h-[290px] animate-pulse bg-white/40 dark:bg-white/5" />
                ))
              : internships.map((internship, index) => (
                  <RevealInView key={internship._id} delay={index * 0.05}>
                    <Card className="h-full">
                      <CardHeader>
                        {internship.coverImageUrl ? (
                          <div className="mb-4 h-48 overflow-hidden rounded-[22px] border border-white/8">
                            <img
                              src={internship.coverImageUrl}
                              alt={internship.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="mb-4 flex h-48 items-center justify-center rounded-[22px] border border-dashed border-white/8 bg-white/5 text-sm text-[#7e8794]">
                            Navyan live cohort
                          </div>
                        )}
                        <CardTitle>{internship.title}</CardTitle>
                        <CardDescription>{internship.shortDescription}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {(internship.skillsRequired || []).slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-[#b7c0cc]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#7e8794]">
                          <span>{internship.mode?.toUpperCase()}</span>
                          <span>{internship.durations?.length || 0} duration options</span>
                        </div>
                        <Link to={`/internships/${internship.slug}`}>
                          <Button className="w-full">
                            View internship
                            <ArrowRight className="ml-2 h-4 w-4" />
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
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
          <RevealInView className="navyan-panel p-6">
            <p className="navyan-pill">Why students choose it</p>
            <h3 className="mt-5 font-display text-3xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
              It feels like a serious platform, not a makeshift internship form.
            </h3>
            <div className="mt-6 space-y-4">
              {[
                "Confident visual hierarchy that reduces confusion during decision-making.",
                "Strong accountability through status visualization and progress cues.",
                "Clean document management for offer letters, assignments, and certificates."
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">{item}</p>
                </div>
              ))}
            </div>
          </RevealInView>

          <RevealInView className="navyan-panel p-6">
            <p className="navyan-pill">Why founders trust it</p>
            <h3 className="mt-5 font-display text-3xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
              The service layer carries the same confidence as the student product.
            </h3>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                { title: "Sharp product thinking", icon: Code2 },
                { title: "Premium UI direction", icon: Sparkles },
                { title: "Technical execution", icon: BriefcaseBusiness },
                { title: "Transparent progress", icon: Clock3 }
              ].map((item) => (
                <div key={item.title} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </RevealInView>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Social proof"
            title="Designed to feel rewarding for students and credible for companies."
            description="Navyan’s experience is engineered to keep users engaged while building long-term brand trust."
          />
          <TestimonialCarousel items={testimonials} />
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="FAQs"
              title="Straight answers, no friction."
              description="The experience is designed to be premium, but the workflow remains practical and understandable."
            />
          </div>
          <Accordion items={faqItems} defaultValue="0" />
        </div>
      </section>

      <section className="navyan-section px-4 pb-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="navyan-hero-panel relative overflow-hidden p-8 md:p-10">
            <div className="navyan-grid-mask" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <p className="navyan-pill">Build your next move with Navyan</p>
                <h3 className="font-display text-4xl font-semibold tracking-[-0.05em] text-[#f5f7fa] md:text-5xl">
                  Join a premium internship system or ship a product with a studio that feels ahead of the curve.
                </h3>
                <p className="text-base leading-8 text-[#b7c0cc]">
                  Explore roles, verify trust, or start a client conversation. Every surface is
                  built to feel modern, precise, and production-ready.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button size="lg">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Start a project
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
