import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, PlayCircle, Sparkles } from "lucide-react";
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
      <section className="navyan-section px-4 pt-12 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-6">
            <div className="navyan-pill">NAVYAN Courses</div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-[#f5f7fa] md:text-5xl">
                Learn through structured video courses before or alongside internships.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-[#b7c0cc]">
                NAVYAN courses are curated from the admin panel and published as clean, watchable
                learning tracks. Explore the right topic, watch the content, then move into live
                internships with more confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/internships">
                <Button>
                  Explore internships
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">Need guidance?</Button>
              </Link>
            </div>
          </div>

          <div className="navyan-panel grid gap-4 p-6 md:grid-cols-2">
            {[
              {
                title: "Practical learning",
                description: "Clear videos students can use as preparation before applying.",
                icon: BookOpen
              },
              {
                title: "Admin-managed publishing",
                description: "Courses go live directly from the backend using YouTube URLs.",
                icon: PlayCircle
              },
              {
                title: "Skill-first progression",
                description: "Courses and internships now sit in one ecosystem instead of disconnected pages.",
                icon: Sparkles
              },
              {
                title: "Fast access",
                description: "Simple embedded learning experience with no confusing friction on the public site.",
                icon: BookOpen
              }
            ].map((item) => (
              <div key={item.title} className="navyan-card px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-slate-950 dark:text-[#f5f7fa]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-[#b7c0cc]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="navyan-section px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Published courses"
            title="Clean course cards with direct video access."
            description="Every course shown here is powered by the backend and published from the admin panel using a YouTube URL."
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
              <p className="font-display text-2xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
                No courses are live right now.
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-[#b7c0cc]">
                New NAVYAN learning tracks will appear here once they are published from the admin panel.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {courses.map((course, index) => (
                <RevealInView key={course._id} delay={index * 0.04}>
                  <Card className="h-full overflow-hidden p-0">
                    <div className="aspect-video overflow-hidden border-b border-black/8 bg-slate-950 dark:border-white/8">
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
                          <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                            {course.category}
                          </span>
                        ) : null}
                        {course.level ? (
                          <span className="rounded-full border border-black/8 bg-black/[0.03] px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]">
                            {course.level}
                          </span>
                        ) : null}
                        {course.durationLabel ? (
                          <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-semibold text-secondary">
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
