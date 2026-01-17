"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Scanning your resume...",
  "Cross-referencing with 200+ PM interviews...",
  "Analyzing your career trajectory...",
  "Consulting the wisdom of Lenny's guests...",
  "Identifying gaps in your experience...",
  "Calculating your career score...",
  "Generating your personalized roast...",
  "Preparing brutally honest feedback...",
];

export function AnalyzingLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto text-center py-12"
    >
      {/* Animated rings */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#6366f1]/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-[#6366f1]/50"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-[#6366f1]/70"
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.3, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <div className="absolute inset-6 rounded-full bg-[#6366f1]/10 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <svg
              className="w-12 h-12 text-[#6366f1]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Loading message */}
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-lg font-medium mb-2"
      >
        {LOADING_MESSAGES[messageIndex]}
      </motion.p>

      <p className="text-sm text-muted-foreground">
        This usually takes 10-15 seconds
      </p>

      {/* Progress bar */}
      <div className="mt-8 w-full h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#6366f1]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 15, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
