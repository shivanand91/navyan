import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export function RevealInView({
  children,
  delay = 0,
  y = 24,
  className
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.18
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
