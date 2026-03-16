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
          <div key={value} className="navyan-card overflow-hidden">
            <button
              type="button"
              id={buttonId}
              aria-controls={panelId}
              aria-expanded={isOpen}
              onClick={() => setOpen((cur) => (cur === value ? null : value))}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.trigger}
                </p>
                {item.sub && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.sub}
                  </p>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
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
                  className="px-5 pb-4"
                >
                  <div className="pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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

