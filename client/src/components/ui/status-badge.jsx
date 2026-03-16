import { cn } from "@/lib/utils";

const statusColorMap = {
  Applied:
    "border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]",
  "Under Review":
    "border border-primary/18 bg-primary/10 text-[#825f25] dark:text-primary",
  Shortlisted:
    "border border-accent/18 bg-accent/12 text-[#6b3fd8] dark:text-accent",
  Selected:
    "border border-success/18 bg-success/12 text-[#188b44] dark:text-success",
  "In Progress":
    "border border-cyan/18 bg-cyan/10 text-[#0f7f8f] dark:text-cyan",
  "Submission Pending":
    "border border-warning/18 bg-warning/12 text-[#a86507] dark:text-warning",
  Submitted:
    "border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/8 dark:bg-white/5 dark:text-[#d4d8de]",
  "Revision Requested":
    "border border-danger/18 bg-danger/12 text-[#c42b56] dark:text-danger",
  Completed:
    "border border-success/18 bg-success/12 text-[#188b44] dark:text-success",
  Rejected:
    "border border-danger/18 bg-danger/12 text-[#c42b56] dark:text-danger"
};

export function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        statusColorMap[status] ||
          "border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/8 dark:bg-white/5 dark:text-[#b7c0cc]"
      )}
    >
      {status}
    </span>
  );
}
