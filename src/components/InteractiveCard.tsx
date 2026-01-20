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
      });
    }
  }, [enableModal, isOpen, openModal, score, archetypeName, archetypeEmoji, archetypeDescription, archetypeImage, element, moves, stage, weakness, flavor, compact, userName, bangerQuote]);

  return (
    <motion.div
      onClick={handleClick}
      className="cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
    </motion.div>
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
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-yellow-500/30 rounded-3xl pointer-events-none"
        style={{ transform: "scale(1.2)" }}
      />

      {/* Card with click to flip */}
      <motion.div
        className="relative cursor-pointer"
        style={{ perspective: "1000px" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* Front */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
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

          {/* Back */}
          <div
            className="absolute top-0 left-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardBack compact rarity={rarity} />
          </div>
        </motion.div>
      </motion.div>

      {/* Click hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground mt-4"
      >
        Click to flip
      </motion.p>
    </motion.div>
  );
}
