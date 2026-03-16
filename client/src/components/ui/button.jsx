import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.985]",
  {
    variants: {
      variant: {
        solid:
          "bg-primary text-[#0f1114] shadow-[0_12px_32px_rgba(212,168,95,0.26)] hover:-translate-y-0.5 hover:bg-secondary hover:shadow-[0_20px_44px_rgba(212,168,95,0.3)]",
        outline:
          "border border-black/10 bg-white/80 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-[#171b21] dark:text-[#f5f7fa] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:hover:bg-[#1d232c] dark:hover:text-white",
        ghost:
          "text-slate-700 hover:bg-black/5 hover:text-slate-950 dark:text-[#b7c0cc] dark:hover:bg-white/5 dark:hover:text-[#f5f7fa]",
        subtle:
          "border border-primary/15 bg-primary/10 text-[#825f25] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-0.5 hover:bg-primary/15 dark:text-primary dark:shadow-none",
        success:
          "border border-success/20 bg-success/12 text-success hover:-translate-y-0.5 hover:bg-success/18",
        danger:
          "border border-danger/18 bg-danger/12 text-danger hover:-translate-y-0.5 hover:bg-danger/18",
        icon:
          "h-10 w-10 rounded-2xl border border-white/10 bg-[#171b21] text-[#f5f7fa] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary"
      },
      size: {
        sm: "h-9 px-4",
        md: "h-10 px-5",
        lg: "h-11 px-6",
        pill: "h-9 px-4 rounded-full",
        icon: "h-10 w-10 rounded-2xl"
      }
    },
    defaultVariants: {
      variant: "solid",
      size: "md"
    }
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
