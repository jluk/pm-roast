"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { CardRarity } from "./HoloCard";

// Rarity display info for the slab header
const RARITY_COLORS: Record<CardRarity, { border: string; glow: string; text: string }> = {
  common: {
    border: "border-gray-500/50",
    glow: "shadow-gray-500/20",
    text: "text-gray-400",
  },
  uncommon: {
    border: "border-blue-500/50",
    glow: "shadow-blue-500/20",
    text: "text-blue-400",
  },
  rare: {
    border: "border-purple-500/50",
    glow: "shadow-purple-500/20",
    text: "text-purple-400",
  },
  ultra: {
    border: "border-pink-500/50",
    glow: "shadow-pink-500/20",
    text: "text-pink-400",
  },
  rainbow: {
    border: "border-transparent",
    glow: "shadow-purple-500/30",
    text: "bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent",
  },
  gold: {
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/30",
    text: "text-yellow-400",
  },
};

const RARITY_LABELS: Record<CardRarity, { label: string; emoji: string }> = {
  common: { label: "Common", emoji: "⚪" },
  uncommon: { label: "Uncommon", emoji: "🔵" },
  rare: { label: "Rare", emoji: "🟣" },
  ultra: { label: "Ultra Rare", emoji: "💗" },
  rainbow: { label: "Rainbow Rare", emoji: "🌈" },
  gold: { label: "Gold Crown", emoji: "👑" },
};

interface PSACardHolderProps {
  children: ReactNode;
  score: number;
  rarity: CardRarity;
  userName?: string;
}

export function PSACardHolder({ children, score, rarity, userName }: PSACardHolderProps) {
  const colors = RARITY_COLORS[rarity];
  const labels = RARITY_LABELS[rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="relative"
    >
      {/* Outer glow based on rarity */}
      <div
        className={`absolute -inset-2 rounded-[28px] blur-xl opacity-40 ${
          rarity === "rainbow"
            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
            : rarity === "gold"
              ? "bg-yellow-500"
              : rarity === "ultra"
                ? "bg-pink-500"
                : "bg-indigo-500"
        }`}
      />

      {/* PSA Slab Container */}
      <div
        className={`relative rounded-[24px] bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 backdrop-blur-xl border-2 ${colors.border} shadow-2xl ${colors.glow}`}
        style={{
          boxShadow:
            rarity === "rainbow"
              ? "0 0 40px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
              : rarity === "gold"
                ? "0 0 40px rgba(234, 179, 8, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 0 30px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Slab Header - Grade Info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            {/* Left: Rarity Badge */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{labels.emoji}</span>
              <span className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
                {labels.label}
              </span>
            </div>

            {/* Right: Score */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 uppercase tracking-wider">Score</span>
              <div className="flex items-baseline">
                <span className="font-mono font-black text-xl text-white">{score}</span>
                <span className="text-xs text-white/40 ml-0.5">/100</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className={`h-full ${
                rarity === "rainbow"
                  ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
                  : rarity === "gold"
                    ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400"
              }`}
            />
          </div>
        </div>

        {/* Card Container */}
        <div className="p-4">
          {children}
        </div>

        {/* Slab Footer - Certification */}
        <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">PM Roast Certified</span>
          </div>
          {userName && (
            <span className="text-xs text-white/40 truncate max-w-[120px]">{userName}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
