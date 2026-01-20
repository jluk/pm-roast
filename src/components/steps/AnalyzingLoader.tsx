"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Mini cards for each loading stage - Pokemon card style
const LOADING_STAGES = [
  {
    message: "Scanning your profile...",
    cardName: "Profile Scanner",
    cardEmoji: "🔍",
    cardType: "data",
    cardColor: "from-blue-400 to-cyan-500",
    borderColor: "#3b82f6",
    hp: 10,
  },
  {
    message: "Cross-referencing PM interviews...",
    cardName: "Lenny's Archive",
    cardEmoji: "📚",
    cardType: "strategy",
    cardColor: "from-purple-400 to-violet-500",
    borderColor: "#8b5cf6",
    hp: 25,
  },
  {
    message: "Analyzing career trajectory...",
    cardName: "Career Mapper",
    cardEmoji: "📈",
    cardType: "shipping",
    cardColor: "from-green-400 to-emerald-500",
    borderColor: "#22c55e",
    hp: 40,
  },
  {
    message: "Calculating your score...",
    cardName: "Score Engine",
    cardEmoji: "🎯",
    cardType: "data",
    cardColor: "from-red-400 to-rose-500",
    borderColor: "#ef4444",
    hp: 60,
  },
  {
    message: "Generating your roast...",
    cardName: "Roast Master",
    cardEmoji: "🔥",
    cardType: "chaos",
    cardColor: "from-orange-400 to-red-500",
    borderColor: "#f97316",
    hp: 80,
  },
  {
    message: "Minting your card...",
    cardName: "Card Forge",
    cardEmoji: "✨",
    cardType: "vision",
    cardColor: "from-yellow-400 to-amber-500",
    borderColor: "#eab308",
    hp: 99,
  },
];

// Mini Pokemon-style card component
function MiniCard({
  name,
  emoji,
  type,
  gradientColor,
  borderColor,
  hp,
  isActive,
}: {
  name: string;
  emoji: string;
  type: string;
  gradientColor: string;
  borderColor: string;
  hp: number;
  isActive: boolean;
}) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative"
      style={{ perspective: "1000px" }}
    >
      {/* Card glow */}
      {isActive && (
        <motion.div
          className={`absolute -inset-4 blur-2xl opacity-50 bg-gradient-to-r ${gradientColor} rounded-3xl`}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Card */}
      <div
        className="relative w-52 h-72 rounded-xl overflow-hidden"
        style={{
          background: `linear-gradient(180deg, #fefce8 0%, #fef3c7 30%, ${borderColor}40 100%)`,
          border: `4px solid ${borderColor}`,
          boxShadow: isActive ? `0 0 30px ${borderColor}50` : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-bold text-sm text-gray-800 truncate">{name}</span>
          <div className="flex items-center gap-1">
            <span className="text-red-600 font-black text-sm">{hp}</span>
            <span className="text-gray-500 text-xs">HP</span>
          </div>
        </div>

        {/* Image area */}
        <div
          className={`mx-3 h-28 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center relative overflow-hidden`}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            animate={{ x: ["-200%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="text-5xl relative z-10"
            animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {emoji}
          </motion.span>
        </div>

        {/* Type badge */}
        <div className="flex justify-center mt-2">
          <span
            className="px-3 py-0.5 rounded-full text-white text-xs font-bold uppercase"
            style={{ backgroundColor: borderColor }}
          >
            {type} Type
          </span>
        </div>

        {/* Move placeholder */}
        <div className="mx-3 mt-2 p-2 bg-white/60 rounded border border-gray-200">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: borderColor }}
            />
            <motion.div
              className="h-2 bg-gray-300 rounded flex-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Loading indicator */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: borderColor }}
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AnalyzingLoader() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);
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
      {/* Card display */}
      <div className="relative mb-6 h-80 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <MiniCard
            key={stageIndex}
            name={currentStage.cardName}
            emoji={currentStage.cardEmoji}
            type={currentStage.cardType}
            gradientColor={currentStage.cardColor}
            borderColor={currentStage.borderColor}
            hp={currentStage.hp}
            isActive={true}
          />
        </AnimatePresence>
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
          <p className={`text-lg font-bold bg-gradient-to-r ${currentStage.cardColor} bg-clip-text text-transparent`}>
            {currentStage.message}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Stage progress - mini card icons */}
      <div className="flex justify-center gap-3 mb-6">
        {LOADING_STAGES.map((stage, index) => (
          <motion.div
            key={index}
            className={`w-8 h-10 rounded flex items-center justify-center text-sm transition-all ${
              index < stageIndex
                ? "bg-green-500/20 border border-green-500/50"
                : index === stageIndex
                ? "bg-white/20 border border-white/50 scale-110"
                : "bg-white/5 border border-white/10"
            }`}
            animate={index === stageIndex ? { scale: [1.1, 1.2, 1.1] } : {}}
            transition={{ duration: 0.8, repeat: index === stageIndex ? Infinity : 0 }}
          >
            {index < stageIndex ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className={index === stageIndex ? "" : "opacity-40"}>{stage.cardEmoji}</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${currentStage.cardColor}`}
          initial={{ width: "0%" }}
          animate={{ width: `${((stageIndex + 1) / LOADING_STAGES.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Generating your PM card...
      </p>
    </motion.div>
  );
}
