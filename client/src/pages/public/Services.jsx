import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, PhoneCall, Sparkles } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModalShell } from "@/components/premium/ModalShell";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";

const deliveryModel = [
  "Discovery-led scoping before engineering begins",
  "Design system thinking instead of ad hoc screens",
  "Clear build phases with practical milestone visibility",
  "Product polish that feels premium across desktop and mobile"
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/services");
        setServices(data.services || []);
      } catch (error) {
        console.error(error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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
                strong visual system and engineering discipline. Every service card below is
                managed from the admin panel so your public trust layer stays current.
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
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-4 py-4"
                >
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
            description="Every service can carry its own feature image, clear value proposition, and direct conversion path into inquiry or a booked call."
          />

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="navyan-card h-[460px] animate-pulse bg-white/40 dark:bg-white/5"
                />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="navyan-card px-6 py-12 text-center">
              <p className="font-display text-2xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                No services are live right now.
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-[#b7c0cc]">
                Add service offerings from the admin panel to populate this page.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service, index) => (
                <RevealInView key={service._id} delay={index * 0.04}>
                  <Card className="flex h-full min-h-[520px] flex-col overflow-hidden p-0">
                    <div className="relative aspect-video overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--card)]">
                      {service.featureImageUrl ? (
                        <img
                          src={service.featureImageUrl}
                          alt={service.title}
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10 px-6 text-center text-sm text-[color:var(--text-secondary)]">
                          Navyan service capability
                        </div>
                      )}
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-[color:var(--card)]/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" />
                        {service.category || "Service"}
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle>{service.title}</CardTitle>
                      <CardDescription>{service.shortDescription}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col justify-between">
                      <div className="space-y-3">
                        {(service.highlights || []).slice(0, 4).map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                            <p className="text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">{item}</p>
                          </div>
                        ))}
                        {service.description ? (
                          <p
                            className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]"
                            style={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 4,
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
                            Apply
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          to={`/contact?mode=call&service=${encodeURIComponent(service.title)}&serviceId=${service._id}`}
                          className="sm:flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            Book call
                            <PhoneCall className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="sm:flex-1"
                          onClick={() => setActiveService(service)}
                        >
                          More details
                          <Eye className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </RevealInView>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="navyan-section px-4 pb-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="navyan-hero-panel p-8 md:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="navyan-pill">Start the conversation</div>
                <h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-white">
                  Need a product partner who can move fast without lowering the standard?
                </h2>
                <p className="text-base leading-8 text-[#b7c0cc]">
                  Choose a service, send your requirement, or book a call directly with your
                  preferred date and time.
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

      <ModalShell
        open={Boolean(activeService)}
        onClose={() => setActiveService(null)}
        title={activeService?.title}
        description={activeService?.shortDescription}
        className="max-w-4xl"
      >
        {activeService ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)]">
              {activeService.featureImageUrl ? (
                <img
                  src={activeService.featureImageUrl}
                  alt={activeService.title}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-primary/10 text-sm text-[color:var(--text-secondary)]">
                  Navyan service capability
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  Full description
                </p>
                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[color:var(--text-secondary)]">
                  {activeService.description || "No extended description added yet."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/contact?mode=inquiry&service=${encodeURIComponent(activeService.title)}&serviceId=${activeService._id}`}
                  className="sm:flex-1"
                >
                  <Button className="w-full">
                    Apply
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  to={`/contact?mode=call&service=${encodeURIComponent(activeService.title)}&serviceId=${activeService._id}`}
                  className="sm:flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Book call
                    <PhoneCall className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  Category
                </p>
                <p className="mt-3 text-sm font-semibold text-[color:var(--text)]">
                  {activeService.category || "General"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}
