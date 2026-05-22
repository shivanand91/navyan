import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "navyan-card transition duration-300 hover:-translate-y-1 hover:border-primary/35",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("px-6 pt-5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        "font-display text-base font-semibold tracking-tight text-[color:var(--text)] md:text-lg",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn(
        "mt-1 text-sm leading-relaxed text-[color:var(--text-secondary)]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("px-6 pb-5 space-y-3", className)} {...props} />;
}
