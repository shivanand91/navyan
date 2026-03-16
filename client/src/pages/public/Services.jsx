import { Link } from "react-router-dom";
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  Code2,
  Layers3,
  PenTool,
  Rocket,
  Smartphone,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";

const services = [
  {
    title: "Website Development",
    description: "Conversion-led marketing experiences with premium composition, performance, and trust-building structure.",
    icon: Blocks
  },
  {
    title: "Web App Development",
    description: "Scalable MERN platforms, dashboards, internal tools, and workflow-heavy products for startups and teams.",
    icon: Layers3
  },
  {
    title: "App Development",
    description: "Mobile-first experiences for user acquisition, service delivery, and product-led growth loops.",
    icon: Smartphone
  },
  {
    title: "UI/UX Design",
    description: "Product thinking, information architecture, design systems, and premium interface refinement.",
    icon: PenTool
  },
  {
    title: "Startup MVP Development",
    description: "Fast-moving build sprints with clean architecture, sharp UI, and founder-speed iteration.",
    icon: Rocket
  },
  {
    title: "Maintenance & Support",
    description: "Long-term product care, interface evolution, reliability work, and execution continuity.",
    icon: Wrench
  }
];

const deliveryModel = [
  "Discovery-led scoping before engineering begins",
  "Design system thinking instead of ad hoc screens",
  "Clear build phases with practical milestone visibility",
  "Product polish that feels premium across desktop and mobile"
];

const packages = [
  {
    title: "Launch",
    summary: "Landing page or marketing platform designed to communicate trust and convert interest.",
    bullets: ["Premium sections", "Performance-focused delivery", "Analytics-ready structure"]
  },
  {
    title: "MVP",
    summary: "End-to-end product sprint for founders validating a workflow-heavy startup idea.",
    bullets: ["Auth and dashboards", "Admin workflows", "Scalable architecture"]
  },
  {
    title: "Scale",
    summary: "Interface and engineering upgrade for products that already have traction but need a stronger system.",
    bullets: ["UX and performance audit", "Refactor plan", "Ongoing support rhythm"]
  }
];

export default function Services() {
  return (
    <div>
      <section className="navyan-section px-4 pt-12 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_0.92fr]">
          <RevealInView className="space-y-6">
            <div className="navyan-pill">Navyan product studio</div>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-[-0.06em] text-slate-950 dark:text-[#f5f7fa] md:text-6xl">
                Premium product execution for founders who want clarity and velocity.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-[#b7c0cc]">
                Navyan designs and ships websites, apps, dashboards, and startup MVPs with a
                strong visual system and engineering discipline. The result feels modern, calm,
                and commercially credible from the first screen.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button size="lg">
                  Start a project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/internships">
                <Button variant="outline" size="lg">
                  Explore internships
                </Button>
              </Link>
            </div>
          </RevealInView>

          <RevealInView className="navyan-panel p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#7e8794]">
              Delivery model
            </p>
            <div className="mt-6 space-y-4">
              {deliveryModel.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">{item}</p>
                </div>
              ))}
            </div>
          </RevealInView>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Service capabilities"
            title="Built for startups, founders, and ambitious brands."
            description="The service experience keeps the same premium tone as the internship platform: sharp hierarchy, high trust, and strong execution cues."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <RevealInView key={service.title} delay={index * 0.04}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
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
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Engagement paths"
            title="Choose the right starting point, then expand cleanly."
            description="The best products do not begin with chaos. Navyan scopes each engagement around stage, urgency, and product ambition."
          />
          <div className="grid gap-4 xl:grid-cols-3">
            {packages.map((pkg, index) => (
              <RevealInView key={pkg.title} delay={index * 0.05}>
                <Card className="h-full">
                  <CardHeader>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
                      {pkg.title}
                    </p>
                    <CardTitle className="mt-3">{pkg.summary}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pkg.bullets.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">{item}</p>
                      </div>
                    ))}
                    <Link to="/contact">
                      <Button variant="outline" className="mt-3 w-full">
                        Discuss {pkg.title.toLowerCase()}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </RevealInView>
            ))}
          </div>
        </div>
      </section>

      <section className="navyan-section px-4 pb-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="navyan-hero-panel p-8 md:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="navyan-pill">Start the conversation</div>
                <h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-[#f5f7fa]">
                  Need a product partner who can move fast without lowering the standard?
                </h2>
                <p className="text-base leading-8 text-[#b7c0cc]">
                  Use Navyan when you need modern interface quality, clear execution, and a
                  build that feels like a real product from day one.
                </p>
              </div>
              <Link to="/contact">
                <Button size="lg">
                  Contact Navyan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
