import { useRef, useState } from "react";
import { FileUp, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import api, { getApiErrorMessage } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeAnalysisResultModal } from "@/components/resume/ResumeAnalysisResultModal";

const roles = ["Software Developer", "Web Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "AI/ML", "Data Analyst", "Data Science", "Cybersecurity", "Cloud/DevOps", "UI/UX", "Product", "Marketing", "Finance", "HR", "Business Analyst"];
const MAX_SIZE = 5 * 1024 * 1024;
const formatSize = (size) => `${(size / 1024 / 1024).toFixed(size > 1024 * 1024 ? 1 : 2)} MB`;

export function ResumeAnalyzer() {
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState(roles[0]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);

  const chooseFile = (next) => {
    if (!next) return;
    const validMime = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(next.type);
    if (!/\.(pdf|docx)$/i.test(next.name) || !validMime) return toast.error("Choose a PDF or DOCX resume.");
    if (next.size > MAX_SIZE) return toast.error("Your resume must be 5 MB or smaller.");
    setFile(next);
    setResult(null);
    setResultOpen(false);
    setErrorMessage("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const analyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    setErrorMessage("");
    setResult(null);
    setResultOpen(false);
    try {
      const form = new FormData();
      form.append("resume", file);
      if (targetRole.trim()) form.append("targetRole", targetRole.trim());
      const { data } = await api.post("/resume/recommendations", form, { headers: { "Content-Type": "multipart/form-data" } });
      if (!data?.success || !Array.isArray(data.recommendations)) throw new Error("The analysis response was incomplete. Please try again.");
      setResult(data);
      setResultOpen(true);
    } catch (error) {
      const message = getApiErrorMessage(error, "We couldn't analyze this resume. Please try another PDF or DOCX.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAnother = () => {
    setResultOpen(false);
    setResult(null);
    setFile(null);
    setTimeout(() => fileInput.current?.click(), 0);
  };

  return <>
    <section className="navyan-panel relative overflow-hidden p-5 md:p-7" aria-labelledby="resume-upload-heading">
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-3"><div><div className="navyan-pill">Personalized internship matches</div><h2 id="resume-upload-heading" className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-textPrimary">Find internships that fit your skills</h2><p className="mt-2 text-sm leading-6 text-textSecondary">Upload your resume for a private, rule-based review of your skills and relevant learning opportunities. No account required.</p></div><Sparkles className="h-6 w-6 shrink-0 text-accent" /></div>
        <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0]); }} className={`rounded-[16px] border border-dashed p-4 transition ${dragging ? "border-primary bg-primary/5" : "border-border bg-backgroundSecondary"}`}>
          {file ? <div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-textPrimary">{file.name}</p><p className="text-xs text-textMuted">{formatSize(file.size)} · ready to analyze</p></div><Button type="button" variant="icon" size="icon" aria-label="Remove resume" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ""; }}><X className="h-4 w-4" /></Button></div> : <div className="text-center"><FileUp className="mx-auto h-6 w-6 text-primary" /><p className="mt-2 text-sm font-semibold text-textPrimary">Drop your PDF or DOCX here</p><button type="button" onClick={() => fileInput.current?.click()} className="mt-1 text-xs font-semibold text-primary hover:underline">or browse files</button><p className="mt-1 text-[11px] text-textMuted">PDF or DOCX · up to 5 MB</p></div>}
          <input ref={fileInput} className="sr-only" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => chooseFile(event.target.files?.[0])} />
        </div>
        <div><label htmlFor="resume-target-role" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.13em] text-textMuted">Target role</label><Input id="resume-target-role" list="resume-roles" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Frontend Developer" /><datalist id="resume-roles">{roles.map((role) => <option value={role} key={role} />)}</datalist></div>
        <Button type="button" variant="accent" size="lg" disabled={loading || !file} onClick={analyze} className="w-full justify-center">{loading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Analyzing your resume...</> : "Analyze Resume"}</Button>
        {loading && <div role="status" aria-live="polite" className="rounded-[12px] bg-backgroundSecondary p-3 text-xs leading-6 text-textSecondary"><p>Reading resume content</p><p>Matching skills against published internships</p><p>Preparing your recommendations</p></div>}
        {errorMessage && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-textSecondary">{errorMessage} Choose a different file or retry your analysis.</div>}
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-textMuted"><ShieldCheck className="h-3.5 w-3.5" />Your resume and extracted text are processed in memory and not stored.</p>
      </div>
    </section>
    <ResumeAnalysisResultModal open={resultOpen} result={result} onClose={() => setResultOpen(false)} onAnalyzeAnother={analyzeAnother} />
  </>;
}
