"use client";

import { useRef, useState, useCallback, useEffect } from "react";
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
}> = {
  common: {
    holoIntensity: 0.08,
    glareIntensity: 0.1,
  },
  uncommon: {
    holoIntensity: 0.15,
    glareIntensity: 0.15,
  },
  rare: {
    holoIntensity: 0.25,
    glareIntensity: 0.2,
  },
  ultra: {
    holoIntensity: 0.3,
    glareIntensity: 0.25,
  },
  rainbow: {
    holoIntensity: 0.4,
    glareIntensity: 0.3,
  },
  gold: {
    holoIntensity: 0.45,
    glareIntensity: 0.35,
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
  disableEffects?: boolean;
  disableScale?: boolean; // Disable scale on hover to prevent layout shift
  score?: number; // Score for determining holographic border (90+ gets border)
}

export function HoloCard({ children, className = "", rarity = "rare", holoEffect, disableEffects = false, disableScale = false, score }: HoloCardProps) {
  const config = RARITY_CONFIG[rarity];
  // Use rarity-based effect unless explicitly overridden
  const effectType = holoEffect || getHoloEffectForRarity(rarity);

  // When effects are disabled, render just the children without any wrapper effects
  if (disableEffects) {
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    );
  }
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    scale: 1,
  });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Skip hover effects on touch devices to prevent flickering
    if (isTouchDevice || !cardRef.current) return;

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
      scale: disableScale ? 1 : 1.05,
    });
  }, [isTouchDevice]);

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
    // Skip hover effects on touch devices
    if (isTouchDevice) return;
    setIsHovering(true);
  }, [isTouchDevice]);

  // Handle touch end to reset state and prevent stuck hover states
  const handleTouchEnd = useCallback(() => {
    setIsHovering(false);
    setStyle({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      scale: 1,
    });
  }, []);

  const showHolographicBorder = score !== undefined && score >= 90;

  return (
    // Outer wrapper: defines perspective for 3D transforms
    // overflow-visible prevents clipping of scaled card, fixed dimensions prevent layout shift
    <div
      className={`relative ${className}`}
      style={{
        perspective: "1000px",
        overflow: "visible",
      }}
    >
      {/* Holographic rainbow border for high-score cards (90+ score) */}
      {showHolographicBorder && (
        <motion.div
          className="absolute -inset-1 rounded-xl pointer-events-none z-0"
          style={{
            background: "linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #ff0080)",
            backgroundSize: "400% 400%",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Inner blur for glow effect */}
          <motion.div
            className="absolute inset-0 rounded-xl blur-sm"
            style={{
              background: "inherit",
              backgroundSize: "inherit",
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      {/* Inner card wrapper: handles mouse events and 3D transforms */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onTouchEnd={handleTouchEnd}
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
        className="relative transform-gpu isolate z-10"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Card content - rendered first so overlays appear on top */}
        <div className="relative z-0">
          {children}
        </div>

        {/* Holographic effect overlay - no blend mode to prevent bleeding */}
        <div
          className="absolute inset-0 rounded-xl z-10 transition-opacity duration-300"
          style={{
            pointerEvents: "none",
            opacity: isHovering ? config.holoIntensity : 0,
            backgroundImage: getHoloGradient(effectType, style.rotateY, rarity, style.glareX, style.glareY),
            backgroundPosition: `${style.glareX}% ${style.glareY}%`,
            backgroundSize: effectType === "amazingRare" || effectType === "galaxy" || effectType === "cosmos" ? "100% 100%" : "200% 200%",
          }}
        />

        {/* Glare/shine effect */}
        <div
          className="absolute inset-0 rounded-xl z-20 transition-opacity duration-300"
          style={{
            pointerEvents: "none",
            opacity: isHovering ? config.glareIntensity : 0,
            backgroundImage: `
              radial-gradient(
                circle at ${style.glareX}% ${style.glareY}%,
                rgba(255, 255, 255, ${0.25 + config.glareIntensity * 0.2}) 0%,
                rgba(255, 255, 255, 0.05) 25%,
                transparent 50%
              )
            `,
          }}
        />

        {/* Sparkle/glitter texture overlay - only for 90+ score cards */}
        {showHolographicBorder && (
          <div
            className="absolute inset-0 rounded-xl z-10 overflow-hidden"
            style={{
              pointerEvents: "none",
              opacity: 0.4,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0.5px, transparent 0.5px),
                  radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0.5px, transparent 0.5px),
                  radial-gradient(circle at 40% 70%, rgba(255,255,255,0.8) 0.5px, transparent 0.5px),
                  radial-gradient(circle at 60% 50%, rgba(255,255,255,0.8) 0.5px, transparent 0.5px),
                  radial-gradient(circle at 10% 80%, rgba(255,255,255,0.8) 0.5px, transparent 0.5px),
                  radial-gradient(circle at 90% 60%, rgba(255,255,255,0.8) 0.5px, transparent 0.5px)
                `,
                backgroundSize: "100% 100%",
                transform: `translate(${(style.glareX - 50) * 0.15}px, ${(style.glareY - 50) * 0.15}px)`,
              }}
            />
          </div>
        )}

      </motion.div>
    </div>
  );
}
