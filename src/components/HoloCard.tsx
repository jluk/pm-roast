"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// Rarity tiers based on score
export type CardRarity = "common" | "uncommon" | "rare" | "ultra" | "rainbow" | "gold";

export function getCardRarity(score: number): CardRarity {
  if (score >= 95) return "gold";
  if (score >= 85) return "rainbow";
  if (score >= 75) return "ultra";
  if (score >= 60) return "rare";
  if (score >= 40) return "uncommon";
  return "common";
}

// Rarity configurations
const RARITY_CONFIG: Record<CardRarity, {
  holoIntensity: number;
  glareIntensity: number;
  sparkleCount: number;
  edgeGlow: string;
}> = {
  common: {
    holoIntensity: 0.2,
    glareIntensity: 0.2,
    sparkleCount: 4,
    edgeGlow: "rgba(156, 163, 175, 0.3)",
  },
  uncommon: {
    holoIntensity: 0.4,
    glareIntensity: 0.3,
    sparkleCount: 6,
    edgeGlow: "rgba(59, 130, 246, 0.4)",
  },
  rare: {
    holoIntensity: 0.6,
    glareIntensity: 0.5,
    sparkleCount: 8,
    edgeGlow: "rgba(139, 92, 246, 0.5)",
  },
  ultra: {
    holoIntensity: 0.75,
    glareIntensity: 0.6,
    sparkleCount: 12,
    edgeGlow: "rgba(236, 72, 153, 0.5)",
  },
  rainbow: {
    holoIntensity: 0.9,
    glareIntensity: 0.8,
    sparkleCount: 16,
    edgeGlow: "rgba(168, 85, 247, 0.6)",
  },
  gold: {
    holoIntensity: 1.0,
    glareIntensity: 1.0,
    sparkleCount: 24,
    edgeGlow: "rgba(251, 191, 36, 0.7)",
  },
};

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  rarity?: CardRarity;
}

export function HoloCard({ children, className = "", rarity = "rare" }: HoloCardProps) {
  const config = RARITY_CONFIG[rarity];
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
        {/* Holographic rainbow gradient overlay */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-20 mix-blend-color-dodge opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? config.holoIntensity : 0,
            backgroundImage: rarity === "gold"
              ? `linear-gradient(
                  ${115 + style.rotateY * 2}deg,
                  rgba(251, 191, 36, 0.6) 0%,
                  rgba(253, 224, 71, 0.6) 25%,
                  rgba(251, 191, 36, 0.6) 50%,
                  rgba(217, 119, 6, 0.6) 75%,
                  rgba(251, 191, 36, 0.6) 100%
                )`
              : `linear-gradient(
                  ${115 + style.rotateY * 2}deg,
                  rgba(255, 0, 128, 0.4) 0%,
                  rgba(255, 140, 0, 0.4) 17%,
                  rgba(255, 255, 0, 0.4) 33%,
                  rgba(0, 255, 128, 0.4) 50%,
                  rgba(0, 200, 255, 0.4) 67%,
                  rgba(128, 0, 255, 0.4) 83%,
                  rgba(255, 0, 128, 0.4) 100%
                )`,
            backgroundPosition: `${style.glareX}% ${style.glareY}%`,
            backgroundSize: "200% 200%",
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
