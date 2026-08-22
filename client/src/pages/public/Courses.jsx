import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevealInView } from "@/components/premium/RevealInView";
import { SectionHeading } from "@/components/premium/SectionHeading";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/courses");
        setCourses(data.courses || []);
      } catch (error) {
        console.error(error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Our Courses"
            title="Learn from Industry Experts"
            description="Access our collection of video courses and resources curated to level up your technical skills."
          />

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="navyan-card h-[420px] animate-pulse bg-white/40 dark:bg-white/5"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="navyan-card px-6 py-14 text-center">
              <p className="font-display text-2xl font-semibold text-textPrimary">
                No courses are live right now.
              </p>
              <p className="mt-3 text-sm text-textSecondary">
                New NAVYAN learning tracks will appear here once they are published from the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {courses.map((course, index) => (
                <RevealInView key={course._id} delay={index * 0.04}>
                  <Card className="h-full overflow-hidden p-0">
                    <div className="aspect-video overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--card-elevated)]">
                      <iframe
                        src={course.embedUrl}
                        title={course.title}
                        className="h-full w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        {course.category ? (
                          <span className="rounded-[8px] border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                            {course.category}
                          </span>
                        ) : null}
                        {course.level ? (
                          <span className="rounded-[8px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] px-3 py-1 text-[11px] font-semibold text-[color:var(--text-secondary)]">
                            {course.level}
                          </span>
                        ) : null}
                        {course.durationLabel ? (
                          <span className="rounded-[8px] border border-border bg-backgroundSecondary px-3 py-1 text-[11px] font-semibold text-textSecondary">
                            {course.durationLabel}
                          </span>
                        ) : null}
                      </div>
                      <CardTitle className="mt-4">{course.title}</CardTitle>
                      <CardDescription>
                        {course.shortDescription || "Structured NAVYAN video course."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <a href={course.watchUrl} target="_blank" rel="noreferrer" className="inline-flex">
                        <Button variant="outline">
                          Watch on YouTube
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                </RevealInView>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
