"use client";

import { HoloCard, getCardRarity } from "./HoloCard";

// PM Element types with full card styling
export const PM_ELEMENTS = {
  data: {
    name: "Data",
    color: "#3b82f6",
    bgGradient: "from-blue-900 via-blue-800 to-cyan-900",
    // Card styling
    borderColor: "#2563eb",
    cardBackground: "linear-gradient(180deg, #eff6ff 0%, #bfdbfe 30%, #60a5fa 100%)",
    innerBorderColor: "rgba(37, 99, 235, 0.3)",
    textPrimary: "#1e3a8a",
    textSecondary: "#1e40af",
    textMuted: "#2563eb",
    weaknessColor: "#1e3a8a", // dark blue for legibility
  },
  chaos: {
    name: "Chaos",
    color: "#ef4444",
    bgGradient: "from-red-900 via-orange-800 to-yellow-900",
    borderColor: "#dc2626",
    cardBackground: "linear-gradient(180deg, #fef2f2 0%, #fecaca 30%, #f87171 100%)",
    innerBorderColor: "rgba(220, 38, 38, 0.3)",
    textPrimary: "#7f1d1d",
    textSecondary: "#991b1b",
    textMuted: "#b91c1c",
    weaknessColor: "#7f1d1d", // dark red for legibility
  },
  strategy: {
    name: "Strategy",
    color: "#8b5cf6",
    bgGradient: "from-purple-900 via-indigo-800 to-violet-900",
    borderColor: "#7c3aed",
    cardBackground: "linear-gradient(180deg, #f5f3ff 0%, #ddd6fe 30%, #a78bfa 100%)",
    innerBorderColor: "rgba(124, 58, 237, 0.3)",
    textPrimary: "#4c1d95",
    textSecondary: "#5b21b6",
    textMuted: "#6d28d9",
    weaknessColor: "#4c1d95", // dark purple for legibility
  },
  shipping: {
    name: "Shipping",
    color: "#22c55e",
    bgGradient: "from-green-900 via-emerald-800 to-teal-900",
    borderColor: "#16a34a",
    cardBackground: "linear-gradient(180deg, #f0fdf4 0%, #bbf7d0 30%, #4ade80 100%)",
    innerBorderColor: "rgba(22, 163, 74, 0.3)",
    textPrimary: "#14532d",
    textSecondary: "#166534",
    textMuted: "#15803d",
    weaknessColor: "#14532d", // dark green for legibility
  },
  politics: {
    name: "Politics",
    color: "#f59e0b",
    bgGradient: "from-amber-900 via-yellow-800 to-orange-900",
    borderColor: "#d97706",
    cardBackground: "linear-gradient(180deg, #fffbeb 0%, #fde68a 30%, #fbbf24 100%)",
    innerBorderColor: "rgba(217, 119, 6, 0.3)",
    textPrimary: "#78350f",
    textSecondary: "#92400e",
    textMuted: "#b45309",
    weaknessColor: "#78350f", // dark amber for legibility
  },
  vision: {
    name: "Vision",
    color: "#ec4899",
    bgGradient: "from-pink-900 via-rose-800 to-fuchsia-900",
    borderColor: "#db2777",
    cardBackground: "linear-gradient(180deg, #fdf2f8 0%, #fbcfe8 30%, #f472b6 100%)",
    innerBorderColor: "rgba(219, 39, 119, 0.3)",
    textPrimary: "#831843",
    textSecondary: "#9d174d",
    textMuted: "#be185d",
    weaknessColor: "#831843", // dark pink for legibility
  },
} as const;

export type PMElement = keyof typeof PM_ELEMENTS;

export interface PMMove {
  name: string;
  energyCost: number; // 1-3 energy symbols
  damage: number;
  effect?: string;
}

interface PokemonCardProps {
  score: number;
  archetypeName: string;
  archetypeEmoji: string;
  archetypeDescription: string;
  archetypeImage?: string;
  element: PMElement;
  moves: PMMove[];
  stage?: string; // e.g., "Basic", "Stage 1", "Senior", "Staff", "Principal"
  weakness?: string; // Funny one-word weakness
  productSense?: number;
  execution?: number;
  leadership?: number;
  flavor?: string; // Pokédex-style text (unused but kept for API compatibility)
  compact?: boolean;
  userName?: string; // User's actual name for personalized cards
}

function EnergySymbol({ element, size = "sm" }: { element: PMElement; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs";
  const elementData = PM_ELEMENTS[element];

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-sm`}
      style={{ backgroundColor: elementData.color }}
    >
      {element.charAt(0).toUpperCase()}
    </div>
  );
}

export function PokemonCard({
  score,
  archetypeName,
  archetypeEmoji,
  archetypeDescription,
  archetypeImage,
  element,
  moves,
  stage = "Senior",
  weakness = "Meetings",
  flavor,
  compact = false,
  userName,
}: PokemonCardProps) {
  const elementData = PM_ELEMENTS[element];
  const rarity = getCardRarity(score);

  // Display name: use userName if available, otherwise archetype name
  const displayName = userName || archetypeName;

  // Dynamic text sizing based on content length
  const getDescriptionTextSize = (text: string, isCompact: boolean) => {
    const len = text.length;
    if (isCompact) {
      if (len < 40) return "text-[11px]";
      if (len < 70) return "text-[10px]";
      if (len < 100) return "text-[9px]";
      return "text-[8px]";
    } else {
      if (len < 40) return "text-sm";
      if (len < 70) return "text-xs";
      if (len < 100) return "text-[11px]";
      return "text-[10px]";
    }
  };

  const getMoveEffectTextSize = (text: string, isCompact: boolean) => {
    const len = text.length;
    if (isCompact) {
      if (len < 30) return "text-[9px]";
      if (len < 50) return "text-[8px]";
      return "text-[7px]";
    } else {
      if (len < 30) return "text-xs";
      if (len < 50) return "text-[11px]";
      return "text-[10px]";
    }
  };

  return (
    <HoloCard className={compact ? "w-[300px]" : "w-[360px] sm:w-[400px]"} rarity={rarity}>
      <div
        className={`relative rounded-xl overflow-hidden border-[6px] flex flex-col ${
          rarity === "rainbow"
            ? "border-transparent"
            : ""
        }`}
        style={{
          background: elementData.cardBackground,
          aspectRatio: "2.5/3.5",
          borderColor: rarity === "rainbow" ? undefined : elementData.borderColor,
          // Rainbow border using gradient for highest rarity
          ...(rarity === "rainbow" && {
            borderImage: "linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6, #22c55e, #eab308, #ec4899) 1",
          }),
        }}
      >
        {/* Inner border effect */}
        <div
          className="absolute inset-1 rounded-lg border-2 pointer-events-none z-10"
          style={{ borderColor: elementData.innerBorderColor }}
        />

        {/* Header: Name + HP */}
        <div className={`flex items-center justify-between ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={compact ? "text-xl" : "text-2xl"} style={{ flexShrink: 0 }}>{archetypeEmoji}</span>
            <div className="min-w-0">
              <h2
                className={`font-black leading-tight ${compact ? "text-xs" : "text-sm"}`}
                style={{ color: elementData.textPrimary }}
              >
                {displayName}
              </h2>
              {userName && (
                <p
                  className={`leading-tight opacity-80 ${compact ? "text-[9px]" : "text-[10px]"}`}
                  style={{ color: elementData.textSecondary }}
                >
                  {archetypeName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className={`font-black text-red-600 ${compact ? "text-lg" : "text-xl"}`}>
              {score}
            </span>
            <span
              className={`font-bold ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: elementData.textMuted }}
            >/100</span>
            <span
              className={`font-bold ml-1 ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: elementData.textSecondary }}
            >HP</span>
            <EnergySymbol element={element} size={compact ? "sm" : "md"} />
          </div>
        </div>

        {/* Image Frame with elemental background */}
        <div className={`${compact ? "mx-3 mb-2" : "mx-4 mb-3"}`}>
          <div
            className={`relative rounded-lg overflow-hidden border-4 ${compact ? "h-36" : "h-52"}`}
            style={{ borderColor: `${elementData.borderColor}66` }}
          >
            {/* Elemental gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${elementData.bgGradient}`} />

            {/* Elemental particles/effects */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2)_0%,transparent_40%)]" />
            </div>

            {archetypeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={archetypeImage}
                alt={archetypeName}
                className="w-full h-full object-cover relative z-10"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center relative z-10">
                <span className={compact ? "text-7xl" : "text-9xl"} style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                  {archetypeEmoji}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Element Type Badge + Stage */}
        <div className={`flex justify-between items-center ${compact ? "mx-3 mb-2" : "mx-4 mb-3"}`}>
          <div
            className={`px-3 py-1 rounded-full text-white font-bold shadow-md ${compact ? "text-xs" : "text-sm"}`}
            style={{ backgroundColor: elementData.color }}
          >
            {elementData.name} Type PM
          </div>
          <span
            className={`italic ${compact ? "text-xs" : "text-sm"}`}
            style={{ color: elementData.textSecondary }}
          >
            {stage}
          </span>
        </div>

        {/* Moves Section - Always 2 moves */}
        <div
          className={`${compact ? "mx-3 mb-2" : "mx-4 mb-3"} bg-white/70 rounded-lg border`}
          style={{ borderColor: elementData.innerBorderColor }}
        >
          {moves.slice(0, 2).map((move, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 last:border-b-0 ${compact ? "px-3 py-1.5" : "px-4 py-2"}`}
              style={{ borderBottomWidth: index === 0 ? 1 : 0, borderColor: elementData.innerBorderColor }}
            >
              {/* Energy Cost */}
              <div className={`flex gap-0.5 shrink-0 ${compact ? "w-10" : "w-14"}`}>
                {Array.from({ length: Math.min(move.energyCost, 3) }).map((_, i) => (
                  <EnergySymbol key={i} element={element} size="sm" />
                ))}
              </div>

              {/* Move Name & Effect */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <span
                  className={`font-bold block truncate ${compact ? "text-[11px] leading-tight" : "text-sm"}`}
                  style={{ color: elementData.textPrimary }}
                >
                  {move.name}
                </span>
                {move.effect && (
                  <p
                    className={`leading-tight mt-0.5 ${getMoveEffectTextSize(move.effect, compact)}`}
                    style={{ color: elementData.textMuted }}
                  >
                    {move.effect}
                  </p>
                )}
              </div>

              {/* Damage */}
              <span
                className={`font-black shrink-0 ${compact ? "text-sm" : "text-lg"}`}
                style={{ color: elementData.textPrimary }}
              >
                {move.damage}
              </span>
            </div>
          ))}
        </div>

        {/* Flavor Text / PM Descriptor */}
        {archetypeDescription && (
          <div
            className={`${compact ? "mx-3 mb-2 px-2 py-2" : "mx-4 mb-3 px-3 py-2.5"} bg-white/50 rounded border overflow-hidden flex-1 flex items-center`}
            style={{ borderColor: elementData.innerBorderColor, minHeight: compact ? "2.5rem" : "3rem" }}
          >
            <p
              className={`italic text-center leading-snug w-full ${getDescriptionTextSize(archetypeDescription, compact)}`}
              style={{ color: elementData.textSecondary }}
            >
              {archetypeDescription}
            </p>
          </div>
        )}

        {/* Bottom: Weakness + Branding */}
        <div
          className={`${compact ? "px-3 py-2" : "px-4 py-2"} flex items-center justify-between mt-auto`}
          style={{ backgroundColor: `${elementData.borderColor}33` }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: elementData.textSecondary }}
            >weakness</span>
            <span
              className={`font-bold ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: elementData.weaknessColor }}
            >{weakness}</span>
          </div>

          <span
            className={`font-semibold ${compact ? "text-xs" : "text-sm"}`}
            style={{ color: elementData.textMuted }}
          >
            pmroast.com
          </span>
        </div>
      </div>
    </HoloCard>
  );
}

// Separate component for displaying stats alongside the card
export function PowerStats({
  productSense,
  execution,
  leadership,
}: {
  productSense: number;
  execution: number;
  leadership: number;
}) {
  const total = productSense + execution + leadership;

  return (
    <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-bold text-gray-300 mb-3 text-center">Power Levels</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="text-sm text-gray-300">Product Sense</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${productSense}%` }}
              />
            </div>
            <span className="text-sm font-bold text-blue-400 w-8 text-right">{productSense}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm text-gray-300">Execution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${execution}%` }}
              />
            </div>
            <span className="text-sm font-bold text-green-400 w-8 text-right">{execution}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <span className="text-sm text-gray-300">Leadership</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${leadership}%` }}
              />
            </div>
            <span className="text-sm font-bold text-purple-400 w-8 text-right">{leadership}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total</span>
            <span className="text-lg font-black text-white">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
