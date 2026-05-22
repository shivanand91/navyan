import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl space-y-3", align === "center" && "items-center")}>
        {eyebrow ? <div className="navyan-pill">{eyebrow}</div> : null}
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)] md:text-[2rem]">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
