import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TestimonialCarousel({ items }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start"
  });

  useEffect(() => {
    if (!emblaApi) return undefined;
    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 5200);

    return () => window.clearInterval(timer);
  }, [emblaApi]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex">
          {items.map((item) => (
            <div key={item.name} className="min-w-0 flex-[0_0_100%] pl-4 md:flex-[0_0_50%]">
              <div className="navyan-card h-full p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
                  <Quote className="h-4 w-4" />
                </div>
                <p className="mt-5 text-base leading-8 text-slate-700 dark:text-[#d9dee6]">
                  {item.quote}
                </p>
                <div className="mt-6">
                  <p className="font-display text-lg font-semibold text-slate-950 dark:text-[#f5f7fa]">
                    {item.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-[#7e8794]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => emblaApi?.scrollPrev()}>
          Previous
        </Button>
        <Button variant="ghost" size="sm" onClick={() => emblaApi?.scrollNext()}>
          Next
        </Button>
      </div>
    </div>
  );
}
