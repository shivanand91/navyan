import { CheckCircle2, ChevronRight, FileBadge, FolderGit2, LineChart, Shield } from "lucide-react";

export default function HeroScene({ className }) {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#0F0F14] p-8 flex flex-col justify-between select-none ${className}`}>
      {/* Premium Tech Grid & Glow Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.12),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />

      {/* Floating System Cards Wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 w-full max-w-lg mx-auto">
        {/* Terminal/IDE Mockup */}
        <div className="w-full rounded-[12px] border border-white/8 bg-[#1A1A22]/90 backdrop-blur-md shadow-2xl p-5 space-y-4 transform -rotate-1 hover:rotate-0 transition-transform duration-700">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60" />
              <span className="ml-2 text-[10px] font-mono tracking-wider text-[#F6F5F8]/60 uppercase">nvy-workspace-console</span>
            </div>
            <div className="rounded-full bg-[#8B5CF6]/20 px-2 py-0.5 text-[9px] font-mono text-[#8B5CF6] font-semibold border border-[#8B5CF6]/30 animate-pulse">
              SYS ACTIVE
            </div>
          </div>

          {/* Timeline Process */}
          <div className="space-y-3.5">
            {[
              {
                title: "Register & Setup Profile",
                desc: "Identify your target track & details",
                status: "done",
                icon: Shield
              },
              {
                title: "Choose Internship & Apply",
                desc: "Submit credentials to active pool",
                status: "done",
                icon: FolderGit2
              },
              {
                title: "Under Review by Coordinator",
                desc: "Reviewing intent, skills, and timeline",
                status: "active",
                icon: LineChart
              },
              {
                title: "Unlocks Verifiable Badge",
                desc: "Permanent registry entry on completion",
                status: "pending",
                icon: FileBadge
              }
            ].map((step, idx) => (
              <div 
                key={step.title} 
                className={`flex gap-3.5 p-3 rounded-[8px] border transition duration-300 ${
                  step.status === "active" 
                    ? "border-[#8B5CF6]/30 bg-[#8B5CF6]/[0.06]" 
                    : step.status === "done"
                      ? "border-white/5 bg-white/[0.01]"
                      : "border-transparent bg-transparent opacity-40"
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-semibold ${
                    step.status === "done"
                      ? "bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]"
                      : step.status === "active"
                        ? "bg-[#8B5CF6] text-[#0F0F14] border-[#8B5CF6] animate-pulse"
                        : "bg-white/5 border-white/10 text-[#A39FAE]"
                  }`}>
                    {step.status === "done" ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  {idx < 3 && <div className="w-[1px] h-8 bg-white/10 mt-1 absolute top-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${step.status === "active" ? "text-[#8B5CF6]" : "text-[#F6F5F8]"}`}>
                      {step.title}
                    </p>
                    {step.status === "active" && (
                      <span className="text-[9px] font-semibold text-[#8B5CF6] uppercase tracking-wider">in-review</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#F6F5F8]/60 mt-0.5 truncate">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Small Overlay Stats Card */}
        <div className="w-3/4 self-end rounded-[12px] border border-white/8 bg-[#1A1A22]/92 backdrop-blur-md shadow-xl p-4 flex items-center justify-between gap-4 transform rotate-1 hover:rotate-0 transition-transform duration-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <FileBadge className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#F6F5F8]">Verifiable Certificate</p>
              <p className="text-[9px] text-[#F6F5F8]/60">Cryptographically signed</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#F6F5F8]/60" />
        </div>
      </div>
    </div>
  );
}
