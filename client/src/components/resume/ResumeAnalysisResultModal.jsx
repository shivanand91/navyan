import { BadgeCheck, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InternshipImage } from "@/components/internships/InternshipImage";
import { ModalShell } from "@/components/premium/ModalShell";

const priceText = (duration) => duration.isPaid ? `₹${Number(duration.price || 0).toLocaleString("en-IN")}` : "Free";
const confetti = Array.from({ length: 18 }, (_, index) => ({
  left: `${5 + ((index * 37) % 90)}%`,
  delay: `${(index % 6) * 70}ms`,
  color: ["#1A8C83", "#F2B544", "#7277D7", "#F27C69"][index % 4],
  rotation: `${(index * 43) % 180}deg`
}));

export function ResumeAnalysisResultModal({ open, result, onClose, onAnalyzeAnother }) {
  if (!result) return null;
  const studentName = typeof result.studentName === "string" ? result.studentName.trim().replace(/\s+/g, " ") : "";
  const personalizedMessage = String(result.personalizedMessage || "").replace(/^Hi(?:\s+[^,]+)?[,]\s*/i, "");

  return <ModalShell open={open} onClose={onClose} title="Resume analysis" description="Your resume insights and internship recommendations" className="resume-modal-enter h-[calc(100dvh-1.5rem)] max-w-5xl rounded-[22px] md:h-auto md:rounded-[28px]" contentClassName="relative">
    <style>{`
      @keyframes resume-confetti-fall { 0% { transform: translate3d(0,-12px,0) rotate(var(--confetti-rotation)); opacity: 0; } 12% { opacity: 1; } 100% { transform: translate3d(18px,190px,0) rotate(calc(var(--confetti-rotation) + 300deg)); opacity: 0; } }
      @keyframes resume-success-pop { 0% { transform: scale(.75); opacity: .4; } 65% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes resume-dialog-enter { from { opacity: 0; transform: translateY(12px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @media (prefers-reduced-motion: no-preference) { .resume-confetti-piece { animation: resume-confetti-fall 1.45s ease-out both; } .resume-success-icon { animation: resume-success-pop .42s ease-out both; } .resume-modal-enter { animation: resume-dialog-enter .24s ease-out both; } }
      @media (prefers-reduced-motion: reduce) { .resume-confetti-piece { display: none; } }
    `}</style>
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 p-5 md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden" aria-hidden="true">{confetti.map((piece, index) => <span key={index} className="resume-confetti-piece absolute top-0 h-2 w-1.5 rounded-sm" style={{ left: piece.left, backgroundColor: piece.color, animationDelay: piece.delay, "--confetti-rotation": piece.rotation }} />)}</div>
      <div className="relative flex items-start gap-3">
        <span className="resume-success-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><BadgeCheck className="h-6 w-6" /></span>
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary"><PartyPopper className="mr-1 inline h-3.5 w-3.5" />Analysis complete</p><h3 className="mt-1 font-display text-2xl font-semibold text-textPrimary">{studentName ? `Hi, ${studentName}!` : "Hi there!"}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-textSecondary">{personalizedMessage}</p></div>
      </div>
    </div>

    <section className="mt-5" aria-labelledby="resume-insights-heading">
      <h3 id="resume-insights-heading" className="font-display text-lg font-semibold text-textPrimary">Resume insights</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3"><Evidence title="Skills identified" items={result.detectedSkills} /><Evidence title="Project evidence" items={result.detectedProjects} /><Evidence title="Experience evidence" items={result.detectedExperience} /></div>
    </section>

    <section className="mt-6" aria-labelledby="resume-recommendations-heading">
      <div className="flex flex-wrap items-end justify-between gap-2"><div><h3 id="resume-recommendations-heading" className="font-display text-lg font-semibold text-textPrimary">Internship recommendations</h3><p className="mt-1 text-xs text-textMuted">Ranked from resume evidence and currently published programs.</p></div><span className="text-[11px] text-textMuted">Rule-based match · not a hiring probability</span></div>
      {result.recommendations?.length ? <div className="mt-3 grid gap-4 md:grid-cols-2">{result.recommendations.map((item) => <RecommendationCard key={item.internshipId} item={item} />)}</div> : <div className="mt-3 rounded-2xl border border-border bg-backgroundSecondary p-5"><p className="font-semibold text-textPrimary">No published matches are available right now.</p><p className="mt-1 text-sm leading-6 text-textSecondary">{result.personalizedMessage}</p></div>}
    </section>

    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="max-w-2xl text-xs leading-5 text-textMuted">{result.notice}</p><div className="flex gap-2"><Button type="button" variant="outline" onClick={onAnalyzeAnother}>Analyze another resume</Button><Button type="button" variant="accent" onClick={onClose}>Close</Button></div></div>
  </ModalShell>;
}

function RecommendationCard({ item }) {
  const internship = item.internship;
  return <article className="navyan-card overflow-hidden">
    {internship.coverImageUrl && <div className="h-40 bg-backgroundSecondary"><InternshipImage src={internship.coverImageUrl} alt={internship.title} className="h-full w-full" fit="cover" /></div>}
    <div className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{item.matchLabel}</span><span className="text-sm font-semibold text-textPrimary">{item.matchScore}% match</span></div>
      <h4 className="mt-3 font-display text-lg font-semibold text-textPrimary">{internship.title}</h4><p className="mt-1 text-xs text-textMuted">{internship.mode || "Mode not listed"}{internship.role ? ` · ${internship.role}` : ""}</p>
      {(internship.shortDescription || internship.description) && <p className="mt-2 line-clamp-3 text-sm leading-6 text-textSecondary">{internship.shortDescription || internship.description}</p>}
      {internship.skillsRequired?.length > 0 && <Evidence title="Program skills" items={internship.skillsRequired} inline />}
      {item.matchedSkills?.length > 0 && <Evidence title="Your matching skills" items={item.matchedSkills} inline />}{item.missingSkills?.length > 0 && <Evidence title="Skills to build" items={item.missingSkills} inline />}
      {item.matchedProjects?.length > 0 && <Evidence title="Related project evidence" items={item.matchedProjects} inline />}{item.matchedExperience?.length > 0 && <Evidence title="Related experience evidence" items={item.matchedExperience} inline />}
      {item.portfolioProjectSuggestions?.length > 0 && <Evidence title="Portfolio ideas" items={item.portfolioProjectSuggestions.slice(0, 2)} inline />}
      {internship.durations?.length > 0 && <div className="mt-3"><p className="text-xs font-semibold text-textPrimary">Available plans</p><ul className="mt-1 flex flex-wrap gap-2">{internship.durations.map((duration) => <li key={duration.key} className="rounded-lg bg-backgroundSecondary px-2.5 py-1 text-xs text-textSecondary">{duration.label || duration.key}: {priceText(duration)}</li>)}</ul></div>}
      <Link className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" to={`/internships/${internship.slug}`}>View internship →</Link>
    </div>
  </article>;
}

function Evidence({ title, items = [], inline = false }) {
  return <div className={inline ? "mt-3" : "rounded-[16px] border border-border p-4"}><p className="text-xs font-semibold text-textPrimary">{title}</p>{items.length ? <ul className={`mt-1 ${inline ? "flex flex-wrap gap-1.5" : "space-y-1"}`}>{items.map((item, index) => <li key={`${item}-${index}`} className={inline ? "rounded-full bg-backgroundSecondary px-2 py-1 text-[11px] text-textSecondary" : "text-xs leading-5 text-textSecondary"}>{inline ? item : `• ${item}`}</li>)}</ul> : <p className="mt-1 text-xs text-textMuted">No clear evidence found in this section.</p>}</div>;
}
