import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]",
  {
    variants: {
      variant: {
        solid:
          "bg-primary text-white hover:bg-primary/90",
        accent:
          "bg-accent text-white hover:bg-accent/90",
        outline:
          "border border-border bg-transparent text-textPrimary hover:bg-primary/5 hover:border-primary/20",
        ghost:
          "text-textSecondary hover:bg-primary/5 hover:text-textPrimary",
        subtle:
          "border border-primary/15 bg-primary/10 text-primary hover:bg-primary/15",
        success:
          "border border-success/20 bg-success/12 text-success hover:bg-success/18",
        danger:
          "border border-danger/18 bg-danger/12 text-danger hover:bg-danger/18",
        icon:
          "h-10 w-10 rounded-[10px] border border-border bg-transparent text-textPrimary hover:bg-primary/20 hover:text-primary"
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
