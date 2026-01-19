"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PokemonCard, PMElement, PMMove } from "./PokemonCard";
import { Button } from "./ui/button";

interface CardPackOpeningProps {
  isReady: boolean;
  onRevealComplete: () => void;
  cardData?: {
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
  };
}

// Sparkle component for the opening effect
function Sparkle({ delay, x, y, size = 2 }: { delay: number; x: number; y: number; size?: number }) {
  return (
    <motion.div
      className="absolute bg-yellow-300 rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0],
        x: [0, (Math.random() - 0.5) * 150],
        y: [0, (Math.random() - 0.5) * 150],
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

// Generate random sparkle positions
function generateSparkles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    y: 30 + Math.random() * 40,
    delay: Math.random() * 0.3,
    size: 2 + Math.random() * 4,
  }));
}

export function CardPackOpening({ isReady, onRevealComplete, cardData }: CardPackOpeningProps) {
  const [stage, setStage] = useState<"loading" | "ready" | "opening" | "revealed">("loading");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);
  const [loadingMessage, setLoadingMessage] = useState(0);
  const [continuousSparkles, setContinuousSparkles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);

  const LOADING_MESSAGES = [
    { text: "Scanning your profile...", emoji: "🔍" },
    { text: "Consulting PM wisdom...", emoji: "📚" },
    { text: "Analyzing career trajectory...", emoji: "📈" },
    { text: "Calculating your score...", emoji: "🎯" },
    { text: "Generating your archetype...", emoji: "✨" },
    { text: "Creating your card...", emoji: "🎴" },
    { text: "Adding holographic finish...", emoji: "🌈" },
    { text: "Pack is almost ready...", emoji: "📦" },
  ];

  // Progress through loading messages
  useEffect(() => {
    if (stage === "loading") {
      const interval = setInterval(() => {
        setLoadingMessage((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [stage, LOADING_MESSAGES.length]);

  // Transition to ready when data is available
  useEffect(() => {
    if (isReady && cardData && stage === "loading") {
      // Small delay to let the last message show
      setTimeout(() => setStage("ready"), 800);
    }
  }, [isReady, cardData, stage]);

  // Continuous sparkles in revealed state
  useEffect(() => {
    if (stage === "revealed") {
      const interval = setInterval(() => {
        setContinuousSparkles(generateSparkles(8));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handlePackClick = useCallback(() => {
    if (stage === "ready") {
      setSparkles(generateSparkles(40));
      setStage("opening");

      // After opening animation, reveal the card
      setTimeout(() => {
        setStage("revealed");
        setContinuousSparkles(generateSparkles(12));
      }, 1200);
    }
  }, [stage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-lg mx-auto text-center py-4"
    >
      <AnimatePresence mode="wait">
        {/* Loading Stage */}
        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Progress indicators */}
            <div className="space-y-2">
              {LOADING_MESSAGES.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= loadingMessage ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`flex items-center gap-3 justify-center ${
                    index <= loadingMessage ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-base">{msg.emoji}</span>
                  <span className={`text-sm ${index === loadingMessage ? "font-medium" : ""}`}>
                    {msg.text}
                  </span>
                  {index < loadingMessage && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500 text-sm"
                    >
                      ✓
                    </motion.span>
                  )}
                  {index === loadingMessage && (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-[#6366f1] rounded-full"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
                initial={{ width: "0%" }}
                animate={{ width: `${((loadingMessage + 1) / LOADING_MESSAGES.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {/* Ready Stage - Shaking Pack */}
        {stage === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="space-y-6"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-foreground"
            >
              Your card is ready! 🎉
            </motion.p>

            {/* Card Pack */}
            <motion.div
              onClick={handlePackClick}
              className="relative w-64 h-80 mx-auto cursor-pointer"
              animate={{
                rotate: [-2, 2, -2],
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pack wrapper */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 shadow-2xl shadow-orange-500/50">
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                  {/* Holographic pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 8px,
                          rgba(255,255,255,0.1) 8px,
                          rgba(255,255,255,0.1) 16px
                        )
                      `,
                    }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
                  />

                  {/* PM Roast Logo */}
                  <div className="relative z-10 text-center">
                    <motion.div
                      className="text-5xl mb-3"
                      animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🔥
                    </motion.div>
                    <div className="font-black text-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                      PM ROAST
                    </div>
                    <p className="text-yellow-400/80 text-xs mt-1 font-medium">
                      Trading Card
                    </p>
                  </div>

                  {/* Sealed indicator */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <motion.div
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-yellow-400 text-xs font-bold tracking-wide">TAP TO OPEN</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <motion.div
                className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-red-500/30 blur-xl -z-10"
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Opening Stage - Sparkles & Explosion */}
        {stage === "opening" && (
          <motion.div
            key="opening"
            className="relative w-64 h-80 mx-auto"
          >
            {/* Exploding sparkles */}
            <div className="absolute inset-0 z-20">
              {sparkles.map((sparkle) => (
                <Sparkle key={sparkle.id} delay={sparkle.delay} x={sparkle.x} y={sparkle.y} size={sparkle.size} />
              ))}
            </div>

            {/* Pack bursting */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1, opacity: 1 }}
              animate={{
                scale: [1, 1.2, 1.5],
                opacity: [1, 0.8, 0],
                rotate: [0, 10, -10],
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500" />
            </motion.div>

            {/* Flash effect */}
            <motion.div
              className="absolute inset-0 bg-white rounded-xl z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, times: [0, 0.3, 1] }}
            />
          </motion.div>
        )}

        {/* Revealed Stage - Card with sparkles */}
        {stage === "revealed" && cardData && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.3, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20,
              duration: 1,
            }}
            className="relative"
          >
            {/* Continuous sparkles around card */}
            <div className="absolute -inset-12 pointer-events-none z-10">
              {continuousSparkles.map((sparkle) => (
                <motion.div
                  key={`cont-${sparkle.id}-${Math.random()}`}
                  className="absolute bg-yellow-300 rounded-full"
                  style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%`, width: sparkle.size, height: sparkle.size }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: sparkle.delay,
                  }}
                />
              ))}
            </div>

            {/* Glowing backdrop */}
            <motion.div
              className="absolute -inset-8 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 blur-2xl -z-10"
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <PokemonCard
              score={cardData.score}
              archetypeName={cardData.archetypeName}
              archetypeEmoji={cardData.archetypeEmoji}
              archetypeDescription={cardData.archetypeDescription}
              archetypeImage={cardData.archetypeImage}
              element={cardData.element}
              moves={cardData.moves}
              stage={cardData.stage}
              weakness={cardData.weakness}
              flavor={cardData.flavor}
              compact
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 space-y-4"
            >
              <p className="text-lg font-semibold text-foreground">
                You&apos;re a <span className="text-yellow-400">{cardData.archetypeName}</span>!
              </p>

              <Button
                onClick={onRevealComplete}
                className="h-12 px-8 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold hover:from-[#5558e3] hover:to-[#7c4fe0] transition-all shadow-lg shadow-[#6366f1]/25"
              >
                See Full Results →
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
