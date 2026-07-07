"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  /** Mono, uppercase, tracked-out kicker above the title */
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Small muted hint under the subtitle (e.g. "Hover to peek the burn") */
  hint?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}

/**
 * One editorial section header used across the site so every section shares the
 * same type rhythm: a mono eyebrow, a tight display title, and a calm subtitle.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  hint,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const aligned = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col ${aligned} ${className}`}
    >
      {eyebrow && (
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-300/70 mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-[15px] leading-relaxed text-white/50 ${align === "center" ? "max-w-xl mx-auto" : "max-w-xl"}`}>
          {subtitle}
        </p>
      )}
      {hint && <p className="mt-2 text-xs text-white/35">{hint}</p>}
    </motion.div>
  );
}
