export default function About() {
  return (
    <div>
      <section className="navyan-section">
        <div className="mx-auto max-w-6xl px-4 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
              About Navyan
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Navyan is a modern Indian tech brand focused on engineering talent and digital
              execution. We run structured internship programs for students and freshers, and we
              operate as a product studio for founders and companies building new digital
              experiences.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our north star is outcome-driven learning and delivery: internships should build
              real skills, and products should ship with premium UX, clean architecture, and
              trustworthy execution.
            </p>
          </div>

          <div className="navyan-card p-6">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              What Navyan stands for
            </p>
            <div className="mt-4 grid gap-3">
              {[
                { k: "Clarity", v: "Clear workflows from application → completion." },
                { k: "Craft", v: "Premium UI/UX and clean engineering." },
                { k: "Trust", v: "Verifiable documents and transparent status updates." },
                { k: "Growth", v: "Real opportunities for students and founders." }
              ].map((x) => (
                <div key={x.k} className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{x.k}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {x.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="navyan-section border-t border-[#e2ddd2] bg-white/75 dark:border-[#23232e] dark:bg-[#0f0f16]/70">
        <div className="mx-auto max-w-6xl px-4 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">
              Built like a product, not a form.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Navyan is a dual-purpose platform: an internship portal for students and a
              service studio for founders. The experience is designed to be premium, structured,
              and scalable.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                t: "Internship workflow",
                d: "Apply → review → selected → task → submission → verified certificate."
              },
              {
                t: "Student-first UX",
                d: "Single profile, minimal apply fields, permanent documents, status visibility."
              },
              {
                t: "Founder execution",
                d: "Design systems, MERN architecture, modern SaaS visuals, and clean delivery."
              }
            ].map((x) => (
              <div key={x.t} className="navyan-card p-5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{x.t}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
