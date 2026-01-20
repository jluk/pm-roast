"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// Rarity tiers based on score
export type CardRarity = "common" | "uncommon" | "rare" | "ultra" | "rainbow" | "gold";

// Holo effect types for visual variety - ordered by rarity/impressiveness
export type HoloEffect = "none" | "subtle" | "linear" | "radial" | "cosmos" | "galaxy" | "amazingRare";

export function getCardRarity(score: number): CardRarity {
  if (score >= 95) return "gold";
  if (score >= 85) return "rainbow";
  if (score >= 75) return "ultra";
  if (score >= 60) return "rare";
  if (score >= 40) return "uncommon";
  return "common";
}

// Map rarity to holo effect - higher rarity = more impressive effect
export function getHoloEffectForRarity(rarity: CardRarity): HoloEffect {
  switch (rarity) {
    case "gold": return "amazingRare";     // Most spectacular - rainbow shifting
    case "rainbow": return "amazingRare";  // Amazing Rare style
    case "ultra": return "galaxy";         // Galaxy/Cosmos swirl
    case "rare": return "cosmos";          // Cosmic sparkle
    case "uncommon": return "radial";      // Radial burst
    case "common": return "subtle";        // Subtle shine
    default: return "subtle";
  }
}

// Legacy function for backward compatibility
export function getHoloEffectForElement(element?: string): HoloEffect {
  // Now defaults to cosmos, but rarity-based is preferred
  return "cosmos";
}

// Rarity configurations - lower rarities have subtler effects
const RARITY_CONFIG: Record<CardRarity, {
  holoIntensity: number;
  glareIntensity: number;
  sparkleCount: number;
  edgeGlow: string;
}> = {
  common: {
    holoIntensity: 0.08,
    glareIntensity: 0.1,
    sparkleCount: 2,
    edgeGlow: "rgba(156, 163, 175, 0.15)",
  },
  uncommon: {
    holoIntensity: 0.15,
    glareIntensity: 0.15,
    sparkleCount: 3,
    edgeGlow: "rgba(59, 130, 246, 0.25)",
  },
  rare: {
    holoIntensity: 0.25,
    glareIntensity: 0.2,
    sparkleCount: 5,
    edgeGlow: "rgba(139, 92, 246, 0.3)",
  },
  ultra: {
    holoIntensity: 0.3,
    glareIntensity: 0.25,
    sparkleCount: 6,
    edgeGlow: "rgba(236, 72, 153, 0.3)",
  },
  rainbow: {
    holoIntensity: 0.4,
    glareIntensity: 0.3,
    sparkleCount: 10,
    edgeGlow: "rgba(168, 85, 247, 0.35)",
  },
  gold: {
    holoIntensity: 0.45,
    glareIntensity: 0.35,
    sparkleCount: 12,
    edgeGlow: "rgba(251, 191, 36, 0.4)",
  },
};

// Generate holo gradient based on effect type
function getHoloGradient(effect: HoloEffect, rotateY: number, rarity: CardRarity, glareX: number, glareY: number): string {
  const angle = 115 + rotateY * 2;

  switch (effect) {
    // Amazing Rare - subtle shimmer effect for gold/rainbow cards
    case "amazingRare":
      if (rarity === "gold") {
        // Gold cards get a subtle gold shimmer
        return `
          conic-gradient(from ${angle}deg at ${glareX}% ${glareY}%,
            rgba(251, 191, 36, 0.3) 0deg,
            rgba(253, 224, 71, 0.35) 30deg,
            rgba(251, 191, 36, 0.3) 60deg,
            rgba(255, 255, 255, 0.4) 90deg,
            rgba(251, 191, 36, 0.3) 120deg,
            rgba(217, 119, 6, 0.3) 180deg,
            rgba(251, 191, 36, 0.3) 240deg,
            rgba(255, 255, 255, 0.35) 270deg,
            rgba(253, 224, 71, 0.3) 300deg,
            rgba(251, 191, 36, 0.3) 360deg
          ),
          radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
        `;
      }
      // Rainbow cards get subtle spectrum effect
      return `
        conic-gradient(from ${angle}deg at ${glareX}% ${glareY}%,
          rgba(255, 0, 0, 0.25) 0deg,
          rgba(255, 127, 0, 0.25) 30deg,
          rgba(255, 255, 0, 0.25) 60deg,
          rgba(0, 255, 0, 0.25) 120deg,
          rgba(0, 255, 255, 0.25) 180deg,
          rgba(0, 127, 255, 0.25) 210deg,
          rgba(139, 0, 255, 0.25) 270deg,
          rgba(255, 0, 255, 0.25) 300deg,
          rgba(255, 0, 127, 0.25) 330deg,
          rgba(255, 0, 0, 0.25) 360deg
        ),
        radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.2) 0%, transparent 40%)
      `;

    // Galaxy - subtle swirling effect for ultra rare
    case "galaxy":
      return `
        conic-gradient(from ${angle}deg at 50% 50%,
          rgba(255, 0, 128, 0.2) 0deg,
          rgba(128, 0, 255, 0.2) 60deg,
          rgba(0, 128, 255, 0.2) 120deg,
          rgba(0, 255, 200, 0.2) 180deg,
          rgba(255, 200, 0, 0.2) 240deg,
          rgba(255, 0, 128, 0.2) 300deg,
          rgba(255, 0, 128, 0.2) 360deg
        ),
        radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, transparent 40%)
      `;

    // Cosmos - subtle sparkly effect for rare
    case "cosmos":
      return `
        radial-gradient(ellipse at 30% 20%, rgba(120, 0, 255, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(0, 200, 255, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
        linear-gradient(${angle}deg, rgba(255, 0, 128, 0.1) 0%, rgba(0, 255, 200, 0.1) 100%)
      `;

    // Radial - very subtle for uncommon
    case "radial":
      return `
        radial-gradient(ellipse at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
        linear-gradient(${angle}deg, rgba(150, 150, 200, 0.08) 0%, rgba(100, 150, 200, 0.08) 100%)
      `;

    // Subtle shine for common - barely visible
    case "subtle":
      return `
        radial-gradient(
          ellipse at ${glareX}% ${glareY}%,
          rgba(255, 255, 255, 0.08) 0%,
          transparent 50%
        )
      `;

    // Linear rainbow stripes
    case "linear":
      return `
        repeating-linear-gradient(
          ${angle}deg,
          rgba(255, 0, 128, 0.35) 0px,
          rgba(255, 140, 0, 0.35) 8px,
          rgba(255, 255, 0, 0.35) 16px,
          rgba(0, 255, 128, 0.35) 24px,
          rgba(0, 200, 255, 0.35) 32px,
          rgba(128, 0, 255, 0.35) 40px,
          rgba(255, 0, 128, 0.35) 48px
        )
      `;

    case "none":
    default:
      return "none";
  }
}

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  rarity?: CardRarity;
  holoEffect?: HoloEffect;
}

export function HoloCard({ children, className = "", rarity = "rare", holoEffect }: HoloCardProps) {
  const config = RARITY_CONFIG[rarity];
  // Use rarity-based effect unless explicitly overridden
  const effectType = holoEffect || getHoloEffectForRarity(rarity);
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    scale: 1,
  });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (max 15 degrees)
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    // Calculate glare position (0-100%)
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setStyle({
      rotateX,
      rotateY,
      glareX,
      glareY,
      scale: 1.05,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setStyle({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      scale: 1,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  return (
    <div
      className={`perspective-1000 ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        animate={{
          rotateX: style.rotateX,
          rotateY: style.rotateY,
          scale: style.scale,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="relative transform-gpu"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Holographic effect overlay - varies by rarity */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-20 mix-blend-color-dodge opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? config.holoIntensity : 0,
            backgroundImage: getHoloGradient(effectType, style.rotateY, rarity, style.glareX, style.glareY),
            backgroundPosition: `${style.glareX}% ${style.glareY}%`,
            backgroundSize: effectType === "amazingRare" || effectType === "galaxy" || effectType === "cosmos" ? "100% 100%" : "200% 200%",
          }}
        />

        {/* Glare/shine effect */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-30 opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? config.glareIntensity : 0,
            backgroundImage: `
              radial-gradient(
                circle at ${style.glareX}% ${style.glareY}%,
                rgba(255, 255, 255, ${0.3 + config.glareIntensity * 0.3}) 0%,
                rgba(255, 255, 255, 0.1) 20%,
                transparent 50%
              )
            `,
          }}
        />

        {/* Sparkle/glitter texture overlay - more sparkles for higher rarity */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-10 opacity-0 transition-opacity duration-300 overflow-hidden"
          style={{
            opacity: isHovering ? config.holoIntensity * 0.6 : 0,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 80% 20%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 40% 70%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 60% 50%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 10% 80%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 90% 60%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 30% 10%, white 0.5px, transparent 0.5px),
                radial-gradient(circle at 70% 90%, white 0.5px, transparent 0.5px)
                ${rarity === "gold" || rarity === "rainbow" ? `,
                radial-gradient(circle at 15% 45%, white 0.7px, transparent 0.7px),
                radial-gradient(circle at 85% 35%, white 0.7px, transparent 0.7px),
                radial-gradient(circle at 45% 15%, white 0.7px, transparent 0.7px),
                radial-gradient(circle at 55% 85%, white 0.7px, transparent 0.7px),
                radial-gradient(circle at 25% 65%, white 0.7px, transparent 0.7px),
                radial-gradient(circle at 75% 75%, white 0.7px, transparent 0.7px)` : ""}
              `,
              backgroundSize: "100% 100%",
              transform: `translate(${(style.glareX - 50) * 0.2}px, ${(style.glareY - 50) * 0.2}px)`,
              filter: "blur(0.3px)",
            }}
          />
        </div>

        {/* Card content */}
        {children}

        {/* Edge lighting effect - intensity based on rarity */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-0"
          style={{
            boxShadow: isHovering
              ? `
                  ${style.rotateY * 2}px ${style.rotateX * -2}px 20px rgba(255, 255, 255, ${0.05 + config.holoIntensity * 0.1}),
                  ${style.rotateY * 4}px ${style.rotateX * -4}px 40px ${config.edgeGlow},
                  0 0 ${40 + config.holoIntensity * 40}px ${config.edgeGlow}
                `
              : `0 0 20px ${config.edgeGlow}`,
            transition: "box-shadow 0.3s ease",
          }}
        />
      </motion.div>
    </div>
  );
}
