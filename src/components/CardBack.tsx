"use client";

import { HoloCard, CardRarity } from "./HoloCard";

interface RoastSummary {
  archetypeName: string;
  score: number;
  bangerQuote: string;
  topRoast?: string;
  element?: string;
  userName?: string;
}

interface CardBackProps {
  compact?: boolean;
  rarity?: CardRarity;
  roastSummary?: RoastSummary;
}

// Rarity labels for display
const RARITY_LABELS: Record<CardRarity, { label: string; color: string }> = {
  common: { label: "Common", color: "text-gray-400" },
  uncommon: { label: "Uncommon", color: "text-blue-400" },
  rare: { label: "Rare", color: "text-purple-400" },
  ultra: { label: "Ultra Rare", color: "text-pink-400" },
  rainbow: { label: "Rainbow", color: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400" },
  gold: { label: "Legendary", color: "text-yellow-400" },
};

export function CardBack({ compact = false, rarity = "rare", roastSummary }: CardBackProps) {
  const rarityInfo = RARITY_LABELS[rarity];

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
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(251, 191, 36, 0.15) 10px,
                  rgba(251, 191, 36, 0.15) 20px
                )
              `,
            }}
          />
        </div>

        {/* Inner border */}
        <div className="absolute inset-3 rounded-lg border-2 border-yellow-500/20" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col p-5">
          {/* Header - PM ROAST branding */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="px-3 py-1 rounded-full text-xs font-black tracking-wider"
                style={{
                  background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
                  color: "#7c2d12",
                }}
              >
                PM ROAST
              </div>
            </div>
            <div className={`text-xs font-bold ${rarityInfo.color}`}>
              {rarityInfo.label}
            </div>
          </div>

          {/* Main content area */}
          {roastSummary ? (
            <div className="flex-1 flex flex-col">
              {/* Archetype name */}
              <div className="text-center mb-3">
                <p className="text-yellow-500/60 text-[10px] uppercase tracking-widest mb-1">You are</p>
                <h2 className={`font-black text-yellow-400 ${compact ? "text-xl" : "text-2xl"}`}>
                  {roastSummary.archetypeName}
                </h2>
                {roastSummary.userName && (
                  <p className="text-yellow-500/50 text-xs mt-0.5">{roastSummary.userName}</p>
                )}
              </div>

              {/* Score badge */}
              <div className="flex justify-center mb-3">
                <div
                  className="relative px-6 py-2 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                  }}
                >
                  <span className="text-yellow-400/70 text-xs">Career Score</span>
                  <span className={`ml-2 font-black ${compact ? "text-xl" : "text-2xl"} text-yellow-400`}>
                    {roastSummary.score}
                  </span>
                  <span className="text-yellow-400/50 text-sm">/100</span>
                </div>
              </div>

              {/* Banger quote - main roast */}
              <div className="flex-1 flex items-center justify-center px-1">
                <div
                  className="relative p-3 rounded-lg w-full"
                  style={{
                    background: "linear-gradient(180deg, rgba(251, 191, 36, 0.05) 0%, rgba(251, 191, 36, 0.02) 100%)",
                    border: "1px solid rgba(251, 191, 36, 0.15)",
                  }}
                >
                  {/* Quote marks */}
                  <span className="absolute -top-1 left-2 text-yellow-500/30 text-2xl font-serif">&ldquo;</span>
                  <p className={`text-yellow-100/90 italic text-center leading-snug ${
                    roastSummary.bangerQuote.length > 100
                      ? (compact ? "text-[9px]" : "text-[10px]")
                      : (compact ? "text-[10px]" : "text-xs")
                  }`}>
                    {roastSummary.bangerQuote.length > 130
                      ? roastSummary.bangerQuote.slice(0, 127) + "..."
                      : roastSummary.bangerQuote}
                  </p>
                  <span className="absolute -bottom-2 right-2 text-yellow-500/30 text-2xl font-serif">&rdquo;</span>
                </div>
              </div>

              {/* Pokeball divider */}
              <div className="flex items-center justify-center gap-2 my-3">
                <div className="flex-1 h-px bg-yellow-500/20" />
                <div className="w-5 h-5 rounded-full border-2 border-yellow-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent" style={{ height: "50%" }} />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-500/30 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
                </div>
                <div className="flex-1 h-px bg-yellow-500/20" />
              </div>

              {/* CTA */}
              <div className="text-center">
                <p className="text-yellow-400/60 text-[10px] uppercase tracking-widest">Get your roast at</p>
                <p className="text-yellow-400 font-bold text-sm">pmroast.com</p>
              </div>
            </div>
          ) : (
            /* Fallback - Original logo design */
            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className={`relative flex flex-col items-center justify-center ${
                  compact ? "w-40 h-28" : "w-52 h-36"
                }`}
                style={{
                  background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                  clipPath: "polygon(10% 0%, 90% 0%, 100% 25%, 100% 75%, 90% 100%, 10% 100%, 0% 75%, 0% 25%)",
                  boxShadow: "0 4px 20px rgba(251, 191, 36, 0.4)",
                }}
              >
                <div
                  className="absolute inset-1"
                  style={{
                    background: "linear-gradient(180deg, #fde68a 0%, #fbbf24 30%, #f59e0b 100%)",
                    clipPath: "polygon(10% 0%, 90% 0%, 100% 25%, 100% 75%, 90% 100%, 10% 100%, 0% 75%, 0% 25%)",
                  }}
                />
                <div className="relative z-10 text-center">
                  <div className={`font-black tracking-tight text-gray-900 ${compact ? "text-xl" : "text-2xl"}`}>
                    PM
                  </div>
                  <div
                    className={`font-black tracking-wider ${compact ? "text-3xl" : "text-4xl"}`}
                    style={{
                      background: "linear-gradient(180deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ROAST
                  </div>
                </div>
              </div>
              <p className={`text-yellow-400/70 font-medium mt-4 ${compact ? "text-xs" : "text-sm"}`}>
                Gotta Ship &apos;Em All
              </p>
              <p className="text-yellow-500/50 text-xs mt-6">pmroast.com</p>
            </div>
          )}
        </div>

        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-yellow-500/20 rounded-tl" />
        <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-yellow-500/20 rounded-tr" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-yellow-500/20 rounded-bl" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-yellow-500/20 rounded-br" />
      </div>
    </HoloCard>
  );
}
