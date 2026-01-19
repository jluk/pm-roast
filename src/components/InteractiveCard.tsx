"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PokemonCard, PMElement, PMMove } from "./PokemonCard";
import { CardBack } from "./CardBack";

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
  enableFlip = true,
  enableModal = true,
}: InteractiveCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (enableModal && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [enableModal, isModalOpen]);

  const handleModalClick = useCallback(() => {
    if (enableFlip) {
      setIsFlipped(!isFlipped);
    }
  }, [enableFlip, isFlipped]);

  const handleCloseModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(false);
    setIsFlipped(false);
  }, []);

  return (
    <>
      {/* Regular Card (clickable to open modal) */}
      <motion.div
        ref={cardRef}
        onClick={handleClick}
        className="cursor-pointer"
        whileHover={{ scale: 1.02, y: -8 }}
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
        />
      </motion.div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            {/* Close hint */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 text-white/60 text-sm flex items-center gap-2"
            >
              <span>Click card to flip</span>
              <span className="text-white/40">|</span>
              <span>Click outside to close</span>
            </motion.div>

            {/* Flippable Card Container */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => {
                e.stopPropagation();
                handleModalClick();
              }}
              className="cursor-pointer"
              style={{ perspective: "1000px" }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative"
              >
                {/* Front of card */}
                <div
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
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
                    compact={false}
                  />
                </div>

                {/* Back of card */}
                <div
                  className="absolute top-0 left-0"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <CardBack compact={false} />
                </div>
              </motion.div>
            </motion.div>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hero card for the landing page - click to enlarge like gallery cards
export function HeroCard() {
  // Example hero card data
  const heroData = {
    score: 85,
    emoji: "🎯",
    name: "Your PM Card",
    description: "Discover your PM archetype and get roasted by AI.",
    element: "vision" as PMElement,
    stage: "???",
    weakness: "???",
    moves: [
      { name: "Get Roasted", energyCost: 1, damage: 99, effect: "Reveal your true PM nature." },
      { name: "Share Results", energyCost: 2, damage: 50, effect: "Flex on LinkedIn." },
    ],
    flavor: "Your personalized PM trading card awaits. Are you ready?",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="relative"
    >
      {/* Floating glow effect */}
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
        className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-yellow-500/30 rounded-3xl"
        style={{ transform: "scale(1.2)" }}
      />

      {/* Card - uses InteractiveCard for click-to-enlarge behavior */}
      <div className="relative">
        <InteractiveCard
          score={heroData.score}
          archetypeName={heroData.name}
          archetypeEmoji={heroData.emoji}
          archetypeDescription={heroData.description}
          element={heroData.element}
          moves={heroData.moves}
          stage={heroData.stage}
          weakness={heroData.weakness}
          flavor={heroData.flavor}
          compact={false}
          enableFlip
          enableModal
        />
      </div>

      {/* Click hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground mt-4"
      >
        Click to enlarge
      </motion.p>
    </motion.div>
  );
}
