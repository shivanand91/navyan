import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneMap = {
  gold: "bg-primary/12 text-primary",
  violet: "bg-accent/14 text-accent",
  cyan: "bg-cyan/12 text-cyan",
  success: "bg-success/12 text-success"
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "gold",
  className
}) {
  return (
    <Card className={cn("group", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
              toneMap[tone] || toneMap.gold
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
          </div>
          {hint ? (
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
              {hint}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-[#7e8794]">
          {label}
        </p>
        <CardTitle className="text-3xl md:text-[2rem]">{value}</CardTitle>
      </CardContent>
    </Card>
  );
}
