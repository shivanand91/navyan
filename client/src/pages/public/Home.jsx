import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  WalletCards
} from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";

const VISITOR_STORAGE_KEY = "navyan_visitor_id";

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
    billing: "FREE",
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

const referralSignals = [
  "Admin can issue referral codes to selected students or partners.",
  "Applications linked to a referral are tracked automatically in the backend.",
  "Rewards can be aligned to actual application volume and performance outcomes."
];

export default function Home() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState(null);

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
        const { data } = await api.get("/internships");
        setInternships(data.internships || []);
      } catch (error) {
        console.error(error);
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
    <div className="pb-10">
      <section className="navyan-section overflow-hidden px-4 pb-8 pt-8 md:px-6 md:pt-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-8">
            <RevealInView>
              <div className="navyan-pill">NAVYAN Internship & Skill Development Platform</div>
            </RevealInView>

            <RevealInView delay={0.04}>
              <div className="space-y-5">
                <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 dark:text-[#f5f7fa] sm:text-5xl lg:text-6xl">
                  Start Your Internship Journey Today
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-[#b7c0cc] md:text-lg">
                  4 Weeks Free + 3 &amp; 6 Months Paid Internships. Apply, get reviewed, start
                  your internship, and track every step clearly with NAVYAN.
                </p>
              </div>
            </RevealInView>

            <RevealInView delay={0.08}>
              <div className="flex flex-wrap gap-3">
                <Link to="/internships">
                  <Button size="lg">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how-navyan-works">
                  <Button variant="outline" size="lg">
                    Watch How It Works
                  </Button>
                </a>
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
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </RevealInView>
          </div>

          <RevealInView delay={0.06}>
            <div className="navyan-panel relative overflow-hidden p-6 md:p-7">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-secondary/12 blur-3xl" />

              <div className="relative space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="navyan-pill">Student + laptop workflow</div>
                    <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-[#f5f7fa] md:text-[2rem]">
                      Clear steps, real mentorship, and visible progress.
                    </h2>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-primary/15 bg-primary/10 text-primary">
                    <Code2 className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="navyan-card px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                        <Users2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                          Student-ready flow
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#7e8794]">
                          Simple apply experience
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="navyan-card px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10 text-secondary">
                        <WalletCards className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
                          Free + paid tracks
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#7e8794]">
                          4 weeks, 3 months, 6 months
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-black/8 bg-white/78 p-5 shadow-[0_24px_60px_rgba(37,99,235,0.08)] dark:border-white/8 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                        Live workflow preview
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-[#f5f7fa]">
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
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ delay: 0.05 * index, duration: 0.45 }}
                        className="flex items-center gap-3 rounded-[20px] border border-black/8 bg-black/[0.02] px-4 py-3 dark:border-white/8 dark:bg-white/5"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-[#f5f7fa]">
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealInView>
        </div>
      </section>

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
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
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
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          program.billing === "FREE"
                            ? "border border-success/20 bg-success/12 text-success"
                            : "border border-secondary/20 bg-secondary/10 text-secondary"
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
                          <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
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
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Why Choose Navyan"
            title="Why students choose NAVYAN."
            description="The experience is designed to stay clear, professional, and easy to trust."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {reasons.map((item, index) => (
              <RevealInView key={item.title} delay={index * 0.04}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
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

      <section id="referrals" className="navyan-section px-4 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
          <SectionHeading
            eyebrow="Referral System"
            title="Referral tracking that stays transparent."
            description="Codes are generated, shares are tracked, and real applications are counted in the backend."
          />

            <div className="space-y-3">
              {referralSignals.map((signal) => (
                <div key={signal} className="flex items-start gap-3 rounded-[22px] border border-black/8 bg-white/72 px-4 py-4 dark:border-white/8 dark:bg-white/5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">{signal}</p>
                </div>
              ))}
            </div>
          </div>

          <RevealInView className="navyan-panel p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Code generated",
                  value: "NAVYAN-REF",
                  icon: ShieldCheck
                },
                {
                  title: "Applications tracked",
                  value: "Backend count",
                  icon: Globe2
                },
                {
                  title: "Qualified referrals",
                  value: "Real intent only",
                  icon: Users2
                },
                {
                  title: "Reward ready",
                  value: "Performance linked",
                  icon: WalletCards
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.05, duration: 0.45 }}
                  className="navyan-card px-5 py-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                    {item.title}
                  </p>
                  <p className="mt-2 font-display text-xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </RevealInView>
        </div>
      </section>

      <section id="testimonials" className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Student Testimonials"
            title="What students say about NAVYAN."
            description="Short feedback helps future applicants understand the experience clearly."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {testimonialCards.map((item, index) => (
              <RevealInView key={item.name} delay={index * 0.05}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <CardDescription className="mt-5 text-base leading-8 text-slate-700 dark:text-[#d9dee6]">
                      “{item.quote}”
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-lg font-semibold text-slate-950 dark:text-[#f5f7fa]">
                      {item.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-[#7e8794]">{item.role}</p>
                  </CardContent>
                </Card>
              </RevealInView>
            ))}
          </div>
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
            <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-secondary/12 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div className="space-y-5">
                <div className="navyan-pill">Final CTA</div>
                <div className="space-y-4">
                  <h2 className="max-w-3xl font-display text-3xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-[#f5f7fa] md:text-4xl lg:text-[2.8rem]">
                    Start with the path that fits your current stage.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-[#b7c0cc] md:text-lg">
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
                      className="rounded-[22px] border border-black/8 bg-white/72 px-4 py-4 text-sm font-medium text-slate-700 dark:border-white/8 dark:bg-white/5 dark:text-[#d7deea]"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              <div className="navyan-card px-5 py-5 md:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#7e8794]">
                  Next step
                </p>
                <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-[#f5f7fa]">
                  Pick one action and move forward.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
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
                  className="mt-5 inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary dark:border-white/10 dark:text-[#b7c0cc] dark:hover:text-white"
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
