import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-[10px] border border-[color:var(--color-input-border)] hover:border-[color:var(--color-input-border-hover)] bg-[color:var(--color-input-bg)] px-4 py-3 text-sm text-[color:var(--color-input-text)] transition placeholder:text-[color:var(--color-input-placeholder)] focus-visible:border-[color:var(--color-input-border-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-input-border-focus)]/35 disabled:cursor-not-allowed disabled:bg-[color:var(--color-input-disabled-bg)] disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});
