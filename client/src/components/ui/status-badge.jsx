import { cn } from "@/lib/utils";

const statusColorMap = {
  Applied:
    "border border-border bg-backgroundSecondary text-textSecondary dark:border-white/8 dark:bg-white/5",
  "Under Review":
    "border border-primary/20 bg-primary/10 text-primary",
  Shortlisted:
    "border border-accent/20 bg-accent/10 text-accent",
  Selected:
    "border border-success/20 bg-success/10 text-success",
  "In Progress":
    "border border-primary/20 bg-primary/10 text-primary",
  "Submission Pending":
    "border border-warning/20 bg-warning/10 text-warning",
  Submitted:
    "border border-border bg-backgroundSecondary text-textSecondary dark:border-white/8 dark:bg-white/5",
  "Revision Requested":
    "border border-danger/20 bg-danger/10 text-danger",
  Completed:
    "border border-success/20 bg-success/10 text-success",
  Rejected:
    "border border-danger/20 bg-danger/10 text-danger"
};

export function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        statusColorMap[status] ||
          "border border-border bg-backgroundSecondary text-textSecondary dark:border-white/8 dark:bg-white/5"
      )}
    >
      {status}
    </span>
  );
}
