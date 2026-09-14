import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Download, FileUp, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import api, { getApiErrorMessage } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalShell } from "@/components/premium/ModalShell";

const roles = ["Software Developer", "Web Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "AI/ML", "Data Analyst", "Data Science", "Cybersecurity", "Cloud/DevOps", "UI/UX", "Product", "Marketing", "Finance", "HR", "Business Analyst"];
const DB = "navyan-resume-pending";
const storePending = (value) => new Promise((resolve) => { const request = indexedDB.open(DB, 1); request.onupgradeneeded = () => request.result.createObjectStore("pending"); request.onsuccess = () => { const tx = request.result.transaction("pending", "readwrite"); tx.objectStore("pending").put(value, "analysis"); tx.oncomplete = resolve; }; request.onerror = resolve; });
const readPending = () => new Promise((resolve) => { const request = indexedDB.open(DB, 1); request.onupgradeneeded = () => request.result.createObjectStore("pending"); request.onsuccess = () => { const tx = request.result.transaction("pending"); const get = tx.objectStore("pending").get("analysis"); get.onsuccess = () => resolve(get.result); get.onerror = () => resolve(null); }; request.onerror = () => resolve(null); });
const clearPending = () => storePending(null);

const formatSize = (size) => `${(size / 1024 / 1024).toFixed(size > 1024 * 1024 ? 1 : 2)} MB`;

export function ResumeAnalyzer() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const fileInput = useRef(null);
  const [file, setFile] = useState(null); const [targetRole, setTargetRole] = useState(roles[0]);
  const [dragging, setDragging] = useState(false); const [loading, setLoading] = useState(false); const [result, setResult] = useState(null);
  const chooseFile = (next) => {
    if (!next) return;
    if (!/\.(pdf|docx)$/i.test(next.name) || !["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(next.type)) return toast.error("Choose a PDF or DOCX resume.");
    if (next.size > 5 * 1024 * 1024) return toast.error("Your resume must be 5 MB or smaller.");
    setFile(next);
  };
  const analyze = async (pending = false) => {
    const resume = pending ? (await readPending())?.file : file;
    const role = pending ? (await readPending())?.targetRole : targetRole;
    if (!resume) return toast.error("Please choose your resume first.");
    if (!role?.trim()) return toast.error("Please enter the role you are targeting.");
    if (!user) {
      await storePending({ file: resume, targetRole: role });
      navigate(`/login?redirect=${encodeURIComponent("/?resume=continue")}`);
      return;
    }
    setLoading(true);
    try {
      const form = new FormData(); form.append("resume", resume); form.append("targetRole", role.trim());
      const { data } = await api.post("/resume/analyze", form, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(data); await clearPending(); setFile(null); toast.success("Your profile has been updated from your resume.");
    } catch (error) { toast.error(getApiErrorMessage(error, "We couldn't analyze this resume. Please try another PDF or DOCX.")); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (params.get("resume") !== "continue" || authLoading || !user) return;
    setParams({}, { replace: true });
    void analyze(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, params]);
  const download = () => {
    if (!result) return;
    const { analysis, recommendations } = result;
    const lines = [`Navyān Resume Analysis`, "", `Target role: ${analysis.targetRole}`, `Overall match: ${analysis.overallMatch}%`, "", "What’s good", ...analysis.strengths.map((x) => `• ${x}`), "", "Improve", ...analysis.improvements.map((x) => `• ${x}`), "", "Skill gaps", ...analysis.skillGaps.map((x) => `• ${x}`), "", "Recommended next step", analysis.internshipNeed, "", "Recommended internships", ...recommendations.map((x) => `• ${x.title} — ${x.matchPercentage}% match`)];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "navyan-resume-analysis.txt"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <>
    <div className="navyan-panel relative overflow-hidden p-5 md:p-7">
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-3"><div><div className="navyan-pill">Career clarity, in a few minutes</div><h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-textPrimary">Know Where Your Resume Stands</h2><p className="mt-2 text-sm leading-6 text-textSecondary">Upload your resume, choose your target role, and get a quick analysis of your strengths, eligibility, and areas to improve.</p></div><Sparkles className="h-6 w-6 shrink-0 text-accent" /></div>
        <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0]); }} className={`rounded-[16px] border border-dashed p-4 transition ${dragging ? "border-primary bg-primary/5" : "border-border bg-backgroundSecondary"}`}>
          {file ? <div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-textPrimary">{file.name}</p><p className="text-xs text-textMuted">{formatSize(file.size)} · ready to analyze</p></div><Button type="button" variant="icon" size="icon" aria-label="Remove resume" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button></div> : <div className="text-center"><FileUp className="mx-auto h-6 w-6 text-primary" /><p className="mt-2 text-sm font-semibold text-textPrimary">Drop your PDF or DOCX here</p><button type="button" onClick={() => fileInput.current?.click()} className="mt-1 text-xs font-semibold text-primary hover:underline">or browse files</button><p className="mt-1 text-[11px] text-textMuted">PDF or DOCX · up to 5 MB</p></div>}
          <input ref={fileInput} className="sr-only" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => chooseFile(event.target.files?.[0])} />
        </div>
        <div><label htmlFor="target-role" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.13em] text-textMuted">Target role</label><Input id="target-role" list="resume-roles" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Frontend Developer" /><datalist id="resume-roles">{roles.map((role) => <option value={role} key={role} />)}</datalist></div>
        <Button type="button" variant="accent" size="lg" disabled={loading} onClick={() => analyze()} className="w-full justify-center">{loading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Analyzing your resume...</> : "Analyze My Resume"}</Button>
        {loading && <div className="rounded-[12px] bg-backgroundSecondary p-3 text-xs leading-6 text-textSecondary"><p>✓ Reading your resume</p><p>✓ Understanding your skills</p><p>→ Evaluating your target role and finding relevant opportunities</p></div>}
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-textMuted"><ShieldCheck className="h-3.5 w-3.5" />Your original resume is not stored.</p>
      </div>
    </div>
    <ModalShell open={Boolean(result)} onClose={() => setResult(null)} title="Resume Analysis" description={result ? `Target role: ${result.analysis.targetRole}` : ""} className="max-w-4xl">
      {result && <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4 rounded-[18px] border border-primary/15 bg-primary/5 p-5"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-textMuted">Overall match</p><p className="mt-1 font-display text-4xl font-semibold text-primary">{result.analysis.overallMatch}%</p></div><p className="max-w-md text-sm text-textSecondary">{result.analysis.overallMatch >= 70 ? "Strong foundation for this role." : result.analysis.overallMatch >= 45 ? "A promising foundation with a few important skills to build." : "Your profile is still developing — focused projects can make a meaningful difference."}</p></div><div className="grid gap-4 md:grid-cols-2"><List title="What’s good" items={result.analysis.strengths} /><List title="Improve" items={result.analysis.improvements} muted /></div><List title="Skill gaps to focus on" items={result.analysis.skillGaps} /><div className="rounded-[16px] border border-border p-4"><p className="text-sm font-semibold text-textPrimary">Recommended next step</p><p className="mt-1 text-sm leading-6 text-textSecondary">{result.analysis.internshipNeed}</p></div><div><p className="font-display text-xl font-semibold text-textPrimary">Recommended internships</p><div className="mt-3 grid gap-3 md:grid-cols-3">{result.recommendations.map((item) => <div className="navyan-card p-4" key={item.internshipId}><p className="font-semibold text-textPrimary">{item.title}</p><p className="mt-1 text-sm font-semibold text-primary">{item.matchPercentage}% match</p><p className="mt-2 text-xs leading-5 text-textSecondary">{item.reason}</p><p className="mt-2 text-[11px] text-textMuted">Focus: {item.requirement}</p><Link className="mt-3 inline-block text-xs font-semibold text-primary hover:underline" to={`/internships/${item.slug}`}>View internship →</Link></div>)}</div></div><Button type="button" variant="outline" onClick={download}><Download className="mr-2 h-4 w-4" />Download Analysis</Button></div>}
    </ModalShell>
  </>;
}
function List({ title, items, muted }) { return <div className="rounded-[16px] border border-border p-4"><p className="text-sm font-semibold text-textPrimary">{title}</p><ul className="mt-2 space-y-2">{(items?.length ? items : ["No additional items found."]).map((item) => <li className={`flex gap-2 text-sm ${muted ? "text-textSecondary" : "text-textPrimary"}`} key={item}><span className="text-primary">•</span>{item}</li>)}</ul></div>; }
