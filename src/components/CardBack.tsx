"use client";

import { motion } from "framer-motion";
import { HoloCard } from "./HoloCard";

interface CardBackProps {
  compact?: boolean;
  rarity?: "common" | "uncommon" | "rare" | "ultra" | "rainbow" | "gold";
}

export function CardBack({ compact = false, rarity = "rare" }: CardBackProps) {
  return (
    <HoloCard className={compact ? "w-[300px]" : "w-[360px] sm:w-[400px]"} rarity={rarity}>
      <div
        className="relative rounded-xl overflow-hidden border-[6px] border-yellow-400"
        style={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
          aspectRatio: "2.5/3.5",
        }}
      >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(251, 191, 36, 0.1) 10px,
                rgba(251, 191, 36, 0.1) 20px
              )
            `,
          }}
        />
      </div>

      {/* Outer decorative border */}
      <div className="absolute inset-3 rounded-lg border-2 border-yellow-500/30" />
      <div className="absolute inset-5 rounded-lg border border-yellow-500/20" />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* PM Roast Logo - Pokemon style */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          {/* Glow effect behind logo */}
          <div
            className="absolute inset-0 blur-2xl opacity-60"
            style={{
              background: "radial-gradient(circle, rgba(251, 191, 36, 0.5) 0%, transparent 70%)",
              transform: "scale(2)",
            }}
          />

          {/* Main logo container */}
          <div className={`relative ${compact ? "p-4" : "p-6"}`}>
            {/* Pokemon-style badge shape */}
            <div
              className={`relative flex flex-col items-center justify-center ${
                compact ? "w-48 h-32" : "w-64 h-44"
              }`}
              style={{
                background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                clipPath: "polygon(10% 0%, 90% 0%, 100% 25%, 100% 75%, 90% 100%, 10% 100%, 0% 75%, 0% 25%)",
                boxShadow: "0 4px 20px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
              }}
            >
              {/* Inner shadow for 3D effect */}
              <div
                className="absolute inset-1"
                style={{
                  background: "linear-gradient(180deg, #fde68a 0%, #fbbf24 30%, #f59e0b 100%)",
                  clipPath: "polygon(10% 0%, 90% 0%, 100% 25%, 100% 75%, 90% 100%, 10% 100%, 0% 75%, 0% 25%)",
                }}
              />

              {/* Logo text */}
              <div className="relative z-10 text-center">
                <div
                  className={`font-black tracking-tight text-gray-900 ${
                    compact ? "text-2xl" : "text-3xl"
                  }`}
                  style={{
                    textShadow: "1px 1px 0 #fde68a, 2px 2px 0 rgba(0,0,0,0.1)",
                  }}
                >
                  PM
                </div>
                <div
                  className={`font-black tracking-wider ${compact ? "text-4xl" : "text-5xl"}`}
                  style={{
                    background: "linear-gradient(180deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "none",
                    filter: "drop-shadow(1px 1px 0 rgba(255,255,255,0.5))",
                  }}
                >
                  ROAST
                </div>
              </div>
            </div>

            {/* Accent elements */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 shadow-lg" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 shadow-lg" />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-yellow-400/80 font-medium mt-4 ${compact ? "text-xs" : "text-sm"}`}
        >
          Gotta Ship &apos;Em All
        </motion.p>

        {/* Decorative pokeball-inspired element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-6 ${compact ? "w-10 h-10" : "w-14 h-14"}`}
        >
          <div className="relative w-full h-full rounded-full border-4 border-yellow-500/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/40 to-transparent" style={{ height: "50%" }} />
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-500/50 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-600/50" />
          </div>
        </motion.div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className={`text-yellow-500/60 font-semibold ${compact ? "text-xs" : "text-sm"}`}>
          pmroast.com
        </span>
      </div>

      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-yellow-500/30 rounded-tl" />
      <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-yellow-500/30 rounded-tr" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-yellow-500/30 rounded-bl" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-yellow-500/30 rounded-br" />
      </div>
    </HoloCard>
  );
}
