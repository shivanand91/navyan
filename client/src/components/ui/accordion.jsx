import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function Accordion({ items, defaultValue, className }) {
  const [open, setOpen] = useState(defaultValue || null);
  const baseId = useId();

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, idx) => {
        const value = item.value || String(idx);
        const isOpen = open === value;
        const buttonId = `${baseId}-btn-${value}`;
        const panelId = `${baseId}-panel-${value}`;

        return (
          <div
            key={value}
            className={cn(
              "navyan-card overflow-hidden transition duration-200",
              isOpen && "border-primary/20 shadow-[0_24px_60px_rgba(37,99,235,0.12)]"
            )}
          >
            <button
              type="button"
              id={buttonId}
              aria-controls={panelId}
              aria-expanded={isOpen}
              onClick={() => setOpen((cur) => (cur === value ? null : value))}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition",
                isOpen ? "bg-primary/[0.035] dark:bg-primary/10" : "hover:bg-black/[0.018] dark:hover:bg-white/[0.03]"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-xs font-semibold text-primary">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white md:text-[15px]">
                  {item.trigger}
                </p>
                {item.sub && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.sub}
                  </p>
                )}
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-white/80 text-slate-500 dark:border-white/8 dark:bg-white/5 dark:text-slate-300">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="border-t border-black/8 px-5 pb-5 dark:border-white/8"
                >
                  <div className="pl-14 pt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
