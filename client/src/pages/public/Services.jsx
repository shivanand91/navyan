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
  "Understanding your needs & requirements",
  "Creating high-quality designs & prototypes",
  "Phase-wise development & coding",
  "Final delivery with 24/7 support"
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
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-border bg-backgroundSecondary text-textSecondary">
              Navyan product studio
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-[-0.06em] text-textPrimary md:text-6xl">
                Professional IT &amp; Development Services
              </h1>
              <p className="max-w-2xl text-base leading-8 text-textSecondary">
                We build premium websites, mobile applications, and customized software to help your business grow. Get clean code, modern designs, and reliable support.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button variant="accent" size="lg">
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
            <p className="text-[11px] uppercase tracking-[0.2em] text-textMuted font-semibold">
              How We Deliver Projects
            </p>
            <div className="mt-6 space-y-3">
              {deliveryModel.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[12px] border border-border bg-backgroundSecondary px-4 py-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <p className="text-sm font-medium text-textSecondary">{item}</p>
                </div>
              ))}
            </div>
          </RevealInView>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Our Services"
            title="What We Can Build For You"
            description="Explore our IT development capabilities and choose the right service for your business needs."
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
              <p className="font-display text-2xl font-semibold text-textPrimary">
                No services are live right now.
              </p>
              <p className="mt-3 text-sm text-textSecondary">
                Check back later for our customized tech solutions.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service, index) => (
                <RevealInView key={service._id} delay={index * 0.04}>
                  <Card className="flex h-full min-h-[480px] flex-col overflow-hidden p-0">
                    <div className="relative aspect-video overflow-hidden border-b border-border bg-backgroundSecondary">
                      {service.featureImageUrl ? (
                        <img
                          src={service.featureImageUrl}
                          alt={service.title}
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10 px-6 text-center text-sm text-textSecondary">
                          Navyan service capability
                        </div>
                      )}
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-card/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-md">
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
                        {(service.highlights || []).slice(0, 3).map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                            <p className="text-sm leading-7 text-textSecondary">{item}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex gap-3 border-t border-border pt-4">
                        <Link
                          to={`/contact?mode=inquiry&service=${encodeURIComponent(service.title)}&serviceId=${service._id}`}
                          className="flex-1"
                        >
                          <Button variant="accent" className="w-full justify-center">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="flex-1 justify-center"
                          onClick={() => setActiveService(service)}
                        >
                          Details
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
          <div className="rounded-[16px] border border-border bg-[#2B2530] p-8 md:p-10 shadow-soft">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-white/10 bg-white/5 text-white/80">
                  Start the conversation
                </div>
                <h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-white">
                  Need a product partner who can deliver results?
                </h2>
                <p className="text-base leading-8 text-white/60">
                  Choose a service, share your requirements, or book a free consultation call.
                </p>
              </div>
              <Link to="/contact">
                <Button variant="accent" size="lg">
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
            <div className="overflow-hidden rounded-[16px] border border-border bg-card">
              {activeService.featureImageUrl ? (
                <img
                  src={activeService.featureImageUrl}
                  alt={activeService.title}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-primary/10 text-sm text-textSecondary">
                  Navyan service capability
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-[12px] border border-border bg-card p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">
                  Full description
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-8 text-textSecondary">
                  {activeService.description || "No extended description added yet."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/contact?mode=inquiry&service=${encodeURIComponent(activeService.title)}&serviceId=${activeService._id}`}
                  className="sm:flex-1"
                >
                  <Button variant="accent" className="w-full justify-center">
                    Inquire / Get Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  to={`/contact?mode=call&service=${encodeURIComponent(activeService.title)}&serviceId=${activeService._id}`}
                  className="sm:flex-1"
                >
                  <Button variant="outline" className="w-full justify-center">
                    Book Call
                    <PhoneCall className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}
