"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { PokemonCard, PMElement, PMMove } from "./PokemonCard";
import { CardBack } from "./CardBack";
import { getCardRarity } from "./HoloCard";
import { useCardModal } from "./CardModalContext";

interface InteractiveCardProps {
  score: number;
  archetypeName: string;
  archetypeEmoji: string;
  archetypeDescription: string;
  archetypeImage?: string;
  element: PMElement;
  moves: PMMove[];
  stage?: string;
  weakness?: string;
  flavor?: string;
  compact?: boolean;
  enableFlip?: boolean;
  enableModal?: boolean;
  userName?: string;
  bangerQuote?: string;
  naturalRival?: string;
}

export function InteractiveCard({
  score,
  archetypeName,
  archetypeEmoji,
  archetypeDescription,
  archetypeImage,
  element,
  moves,
  stage,
  weakness,
  flavor,
  compact = false,
  enableModal = true,
  userName,
  bangerQuote,
  naturalRival,
}: InteractiveCardProps) {
  const { openModal, isOpen } = useCardModal();

  const handleClick = useCallback(() => {
    if (enableModal && !isOpen) {
      openModal({
        score,
        archetypeName,
        archetypeEmoji,
        archetypeDescription,
        archetypeImage,
        element,
        moves,
        stage,
        weakness,
        flavor,
        compact,
        userName,
        bangerQuote,
        naturalRival,
      });
    }
  }, [enableModal, isOpen, openModal, score, archetypeName, archetypeEmoji, archetypeDescription, archetypeImage, element, moves, stage, weakness, flavor, compact, userName, bangerQuote, naturalRival]);

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer"
    >
      <PokemonCard
        score={score}
        archetypeName={archetypeName}
        archetypeEmoji={archetypeEmoji}
        archetypeDescription={archetypeDescription}
        archetypeImage={archetypeImage}
        element={element}
        moves={moves}
        stage={stage}
        weakness={weakness}
        flavor={flavor}
        compact={compact}
        userName={userName}
      />
    </div>
  );
}

// Hero card for the landing page - click to flip, hover for subtle scale
export function HeroCard() {
  const [isFlipped, setIsFlipped] = useState(false);

  // Example hero card data - matches gallery style
  const heroData = {
    score: 85,
    emoji: "✨",
    name: "Your PM Card",
    description: "Discover your archetype. Get brutally roasted. Share the results.",
    element: "vision" as PMElement,
    stage: "???",
    weakness: "???",
    moves: [
      { name: "Get Roasted", energyCost: 1, damage: 99, effect: "Reveal your true PM nature." },
      { name: "Share Card", energyCost: 2, damage: 50, effect: "Post to X and LinkedIn." },
    ],
    flavor: "Your personalized trading card awaits. Are you ready?",
    archetypeImage: "/cards/your-pm-card.png",
  };

  const rarity = getCardRarity(heroData.score);

  // Card dimensions for compact mode
  const cardWidth = 300;
  const cardHeight = cardWidth * 1.4; // 2.5:3.5 aspect ratio

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="relative"
    >
      {/* Floating glow effect - pointer-events-none so clicks pass through */}
      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-yellow-500/30 rounded-3xl pointer-events-none"
        style={{ transform: "scale(1.2)" }}
      />

      {/* Card with click to flip - fixed dimensions to prevent layout shift */}
      <div
        className="relative cursor-pointer select-none"
        style={{
          perspective: "1000px",
          width: cardWidth,
          height: cardHeight,
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
            willChange: "transform",
          }}
          className="relative"
        >
          {/* Front - use opacity for visibility since backfaceVisibility breaks with HoloCard's nested 3D context */}
          <div
            className="absolute inset-0 transition-opacity duration-150"
            style={{
              opacity: isFlipped ? 0 : 1,
              pointerEvents: isFlipped ? "none" : "auto",
            }}
          >
            <PokemonCard
              score={heroData.score}
              archetypeName={heroData.name}
              archetypeEmoji={heroData.emoji}
              archetypeDescription={heroData.description}
              archetypeImage={heroData.archetypeImage}
              element={heroData.element}
              moves={heroData.moves}
              stage={heroData.stage}
              weakness={heroData.weakness}
              flavor={heroData.flavor}
              compact
            />
          </div>

          {/* Back - use opacity for visibility since backfaceVisibility breaks with HoloCard's nested 3D context */}
          <div
            className="absolute inset-0 transition-opacity duration-150"
            style={{
              opacity: isFlipped ? 1 : 0,
              pointerEvents: isFlipped ? "auto" : "none",
              transform: "rotateY(180deg)",
            }}
          >
            <CardBack compact rarity={rarity} />
          </div>
        </motion.div>
      </div>

      {/* Click hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground mt-4"
      >
        Tap to flip
      </motion.p>
    </motion.div>
  );
}
