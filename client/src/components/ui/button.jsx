import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]",
  {
    variants: {
      variant: {
        solid:
          "bg-[color:var(--color-button-primary-bg)] text-[color:var(--color-button-primary-text)] hover:bg-[color:var(--color-button-primary-bg-hover)] active:bg-[color:var(--color-button-primary-bg-active)] disabled:bg-[color:var(--color-button-disabled-bg)] disabled:text-[color:var(--color-button-disabled-text)]",
        accent:
          "bg-[color:var(--color-button-accent-bg)] text-[color:var(--color-button-accent-text)] hover:bg-[color:var(--color-button-accent-bg-hover)] disabled:bg-[color:var(--color-button-disabled-bg)] disabled:text-[color:var(--color-button-disabled-text)]",
        outline:
          "border border-[color:var(--color-button-secondary-border)] bg-[color:var(--color-button-secondary-bg)] text-[color:var(--color-button-secondary-text)] hover:bg-[color:var(--color-button-secondary-bg-hover)] disabled:bg-[color:var(--color-button-disabled-bg)] disabled:text-[color:var(--color-button-disabled-text)]",
        ghost:
          "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-button-secondary-bg-hover)] hover:text-[color:var(--color-text-primary)]",
        subtle:
          "border border-[color:var(--color-info-border)] bg-[color:var(--color-info-bg)] text-[color:var(--color-info-text)] hover:opacity-90",
        success:
          "border border-[color:var(--color-success-border)] bg-[color:var(--color-success-bg)] text-[color:var(--color-success-text)] hover:opacity-90",
        danger:
          "bg-[color:var(--color-button-danger-bg)] text-[color:var(--color-button-danger-text)] hover:bg-[color:var(--color-button-danger-bg-hover)] disabled:bg-[color:var(--color-button-disabled-bg)] disabled:text-[color:var(--color-button-disabled-text)]",
        icon:
          "h-10 w-10 rounded-[10px] border border-[color:var(--color-border)] bg-transparent text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-button-secondary-bg-hover)] hover:text-[color:var(--color-button-primary-bg)]"
      },
      size: {
        sm: "h-9 px-4",
        md: "h-10 px-5",
        lg: "h-11 px-6",
        pill: "h-9 px-4 rounded-full",
        icon: "h-10 w-10 rounded-[10px]"
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
