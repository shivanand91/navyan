import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-black/10 bg-white/82 px-4 py-2 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:border-primary/55 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#171b21] dark:text-[#f5f7fa] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:placeholder:text-[#7e8794]",
        className
      )}
      {...props}
    />
  );
});
