"use client";

import { HoloCard, getCardRarity, CardRarity } from "./HoloCard";

// Card styling based on rarity
const RARITY_STYLES: Record<CardRarity, {
  borderColor: string;
  borderClass: string;
  background: string;
  innerBorderColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}> = {
  common: {
    borderColor: "#6b7280", // darker gray for better contrast
    borderClass: "border-gray-500",
    background: "linear-gradient(180deg, #f9fafb 0%, #e5e7eb 20%, #9ca3af 100%)",
    innerBorderColor: "rgba(75, 85, 99, 0.3)",
    textPrimary: "#1f2937", // gray-800
    textSecondary: "#374151", // gray-700
    textMuted: "#4b5563", // gray-600
  },
  uncommon: {
    borderColor: "#2563eb", // blue-600
    borderClass: "border-blue-600",
    background: "linear-gradient(180deg, #eff6ff 0%, #bfdbfe 20%, #3b82f6 100%)",
    innerBorderColor: "rgba(37, 99, 235, 0.3)",
    textPrimary: "#1e3a8a", // blue-900
    textSecondary: "#1e40af", // blue-800
    textMuted: "#1d4ed8", // blue-700
  },
  rare: {
    borderColor: "#7c3aed", // violet-600
    borderClass: "border-violet-600",
    background: "linear-gradient(180deg, #f5f3ff 0%, #ddd6fe 20%, #8b5cf6 100%)",
    innerBorderColor: "rgba(124, 58, 237, 0.3)",
    textPrimary: "#4c1d95", // violet-900
    textSecondary: "#5b21b6", // violet-800
    textMuted: "#6d28d9", // violet-700
  },
  ultra: {
    borderColor: "#db2777", // pink-600
    borderClass: "border-pink-600",
    background: "linear-gradient(180deg, #fdf2f8 0%, #fbcfe8 20%, #ec4899 100%)",
    innerBorderColor: "rgba(219, 39, 119, 0.3)",
    textPrimary: "#831843", // pink-900
    textSecondary: "#9d174d", // pink-800
    textMuted: "#be185d", // pink-700
  },
  rainbow: {
    borderColor: "#a855f7", // purple for base
    borderClass: "border-purple-500",
    background: "linear-gradient(135deg, #fdf2f8 0%, #eff6ff 25%, #ecfdf5 50%, #fefce8 75%, #fdf2f8 100%)",
    innerBorderColor: "rgba(168, 85, 247, 0.4)",
    textPrimary: "#1f2937", // gray-800
    textSecondary: "#374151", // gray-700
    textMuted: "#4b5563", // gray-600
  },
  gold: {
    borderColor: "#d97706", // amber-600
    borderClass: "border-amber-600",
    background: "linear-gradient(180deg, #fffbeb 0%, #fde68a 20%, #f59e0b 100%)",
    innerBorderColor: "rgba(180, 83, 9, 0.3)",
    textPrimary: "#78350f", // amber-900
    textSecondary: "#92400e", // amber-800
    textMuted: "#b45309", // amber-700
  },
};

// PM Element types with colors (like Pokemon types)
export const PM_ELEMENTS = {
  data: { name: "Data", color: "#3b82f6", bgGradient: "from-blue-900 via-blue-800 to-cyan-900" },
  chaos: { name: "Chaos", color: "#ef4444", bgGradient: "from-red-900 via-orange-800 to-yellow-900" },
  strategy: { name: "Strategy", color: "#8b5cf6", bgGradient: "from-purple-900 via-indigo-800 to-violet-900" },
  shipping: { name: "Shipping", color: "#22c55e", bgGradient: "from-green-900 via-emerald-800 to-teal-900" },
  politics: { name: "Politics", color: "#f59e0b", bgGradient: "from-amber-900 via-yellow-800 to-orange-900" },
  vision: { name: "Vision", color: "#ec4899", bgGradient: "from-pink-900 via-rose-800 to-fuchsia-900" },
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
}: PokemonCardProps) {
  const elementData = PM_ELEMENTS[element];
  const rarity = getCardRarity(score);
  const rarityStyle = RARITY_STYLES[rarity];

  return (
    <HoloCard className={compact ? "w-[300px]" : "w-[360px] sm:w-[400px]"} rarity={rarity}>
      <div
        className={`relative rounded-xl overflow-hidden border-[6px] flex flex-col ${
          rarity === "rainbow"
            ? "border-transparent"
            : ""
        }`}
        style={{
          background: rarityStyle.background,
          aspectRatio: "2.5/3.5",
          borderColor: rarity === "rainbow" ? undefined : rarityStyle.borderColor,
          // Rainbow border using gradient
          ...(rarity === "rainbow" && {
            borderImage: "linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6, #22c55e, #eab308, #ec4899) 1",
          }),
        }}
      >
        {/* Inner border effect */}
        <div
          className="absolute inset-1 rounded-lg border-2 pointer-events-none z-10"
          style={{ borderColor: rarityStyle.innerBorderColor }}
        />

        {/* Header: Name + HP */}
        <div className={`flex items-center justify-between ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={compact ? "text-xl" : "text-2xl"} style={{ flexShrink: 0 }}>{archetypeEmoji}</span>
            <h2
              className={`font-black leading-tight ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: rarityStyle.textPrimary }}
            >
              {archetypeName}
            </h2>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className={`font-black text-red-600 ${compact ? "text-lg" : "text-xl"}`}>
              {score}
            </span>
            <span
              className={`font-bold ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: rarityStyle.textMuted }}
            >/100</span>
            <span
              className={`font-bold ml-1 ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: rarityStyle.textSecondary }}
            >HP</span>
            <EnergySymbol element={element} size={compact ? "sm" : "md"} />
          </div>
        </div>

        {/* Image Frame with elemental background */}
        <div className={`${compact ? "mx-3 mb-2" : "mx-4 mb-3"}`}>
          <div
            className={`relative rounded-lg overflow-hidden border-4 ${compact ? "h-36" : "h-52"}`}
            style={{ borderColor: `${rarityStyle.borderColor}66` }}
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
            style={{ color: rarityStyle.textSecondary }}
          >
            {stage}
          </span>
        </div>

        {/* Moves Section - Always 2 moves */}
        <div
          className={`${compact ? "mx-3 mb-2" : "mx-4 mb-3"} bg-white/70 rounded-lg border`}
          style={{ borderColor: rarityStyle.innerBorderColor }}
        >
          {moves.slice(0, 2).map((move, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 last:border-b-0 ${compact ? "px-3 py-1.5" : "px-4 py-2"}`}
              style={{ borderBottomWidth: index === 0 ? 1 : 0, borderColor: rarityStyle.innerBorderColor }}
            >
              {/* Energy Cost */}
              <div className={`flex gap-0.5 shrink-0 ${compact ? "w-10" : "w-14"}`}>
                {Array.from({ length: Math.min(move.energyCost, 3) }).map((_, i) => (
                  <EnergySymbol key={i} element={element} size="sm" />
                ))}
              </div>

              {/* Move Name & Effect */}
              <div className="flex-1 min-w-0">
                <span
                  className={`font-bold block ${compact ? "text-[11px] leading-tight" : "text-sm"}`}
                  style={{ color: rarityStyle.textPrimary }}
                >
                  {move.name}
                </span>
                {move.effect && (
                  <p
                    className={`leading-tight mt-0.5 ${compact ? "text-[9px]" : "text-xs"}`}
                    style={{ color: rarityStyle.textMuted }}
                  >
                    {move.effect}
                  </p>
                )}
              </div>

              {/* Damage */}
              <span
                className={`font-black shrink-0 ${compact ? "text-sm" : "text-lg"}`}
                style={{ color: rarityStyle.textPrimary }}
              >
                {move.damage}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom: Weakness + Branding */}
        <div
          className={`${compact ? "px-3 py-2" : "px-4 py-2"} flex items-center justify-between mt-auto`}
          style={{ backgroundColor: `${rarityStyle.borderColor}33` }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: rarityStyle.textSecondary }}
            >weakness</span>
            <span className={`font-bold text-red-600 ${compact ? "text-xs" : "text-sm"}`}>{weakness}</span>
          </div>

          <span
            className={`font-semibold ${compact ? "text-xs" : "text-sm"}`}
            style={{ color: rarityStyle.textMuted }}
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
