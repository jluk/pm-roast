"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const LOADING_STAGES = [
  { message: "Scanning your profile...", emoji: "🔍", color: "from-blue-500 to-cyan-500" },
  { message: "Cross-referencing 200+ PM interviews...", emoji: "📚", color: "from-purple-500 to-pink-500" },
  { message: "Analyzing your career trajectory...", emoji: "📈", color: "from-green-500 to-emerald-500" },
  { message: "Consulting Lenny's wisdom...", emoji: "🎙️", color: "from-yellow-500 to-orange-500" },
  { message: "Calculating your career score...", emoji: "🎯", color: "from-red-500 to-pink-500" },
  { message: "Generating your roast...", emoji: "🔥", color: "from-orange-500 to-red-500" },
  { message: "Minting your card...", emoji: "✨", color: "from-yellow-400 to-amber-500" },
];

export function AnalyzingLoader() {
  const [stageIndex, setStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          setCompletedStages((completed) => [...completed, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentStage = LOADING_STAGES[stageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto text-center"
    >
      {/* Card being generated animation */}
      <div className="relative mb-8">
        {/* Glow effect */}
        <motion.div
          className={`absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r ${currentStage.color}`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Card placeholder with shimmer */}
        <div className="relative w-48 h-64 mx-auto rounded-xl border-2 border-white/20 overflow-hidden bg-gradient-to-b from-neutral-800 to-neutral-900">
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            animate={{ x: ["-200%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Card content skeleton */}
          <div className="absolute inset-4 space-y-3">
            <div className="h-3 bg-white/10 rounded w-2/3" />
            <div className="h-20 bg-white/5 rounded-lg" />
            <div className="h-2 bg-white/10 rounded w-1/2" />
            <div className="h-2 bg-white/10 rounded w-3/4" />
            <div className="h-2 bg-white/10 rounded w-1/2" />
          </div>

          {/* Animated emoji in center */}
          <motion.div
            key={stageIndex}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute inset-0 flex items-center justify-center text-5xl"
          >
            {currentStage.emoji}
          </motion.div>
        </div>
      </div>

      {/* Current stage message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stageIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <p className={`text-xl font-bold bg-gradient-to-r ${currentStage.color} bg-clip-text text-transparent`}>
            {currentStage.message}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Stage progress dots */}
      <div className="flex justify-center gap-2 mb-6">
        {LOADING_STAGES.map((stage, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              completedStages.includes(index)
                ? "bg-green-500"
                : index === stageIndex
                ? "bg-white"
                : "bg-white/20"
            }`}
            animate={index === stageIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: index === stageIndex ? Infinity : 0 }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${currentStage.color}`}
          initial={{ width: "0%" }}
          animate={{ width: `${((stageIndex + 1) / LOADING_STAGES.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        This usually takes 10-15 seconds
      </p>
    </motion.div>
  );
}
