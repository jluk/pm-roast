"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PokemonCard, PMElement, PMMove } from "./PokemonCard";

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
function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-yellow-300 rounded-full"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0],
        x: [0, (Math.random() - 0.5) * 100],
        y: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: 0.8,
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
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
    delay: Math.random() * 0.5,
  }));
}

export function CardPackOpening({ isReady, onRevealComplete, cardData }: CardPackOpeningProps) {
  const [stage, setStage] = useState<"loading" | "ready" | "opening" | "revealed">("loading");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [loadingMessage, setLoadingMessage] = useState(0);

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
      setTimeout(() => setStage("ready"), 500);
    }
  }, [isReady, cardData, stage]);

  const handlePackClick = () => {
    if (stage === "ready") {
      setSparkles(generateSparkles(30));
      setStage("opening");

      // After opening animation, reveal the card
      setTimeout(() => {
        setStage("revealed");
        // Give time for card reveal animation
        setTimeout(onRevealComplete, 1500);
      }, 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-lg mx-auto text-center py-8"
    >
      <AnimatePresence mode="wait">
        {/* Loading Stage */}
        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Progress indicators */}
            <div className="space-y-3">
              {LOADING_MESSAGES.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= loadingMessage ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={`flex items-center gap-3 justify-center ${
                    index <= loadingMessage ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{msg.emoji}</span>
                  <span className={`text-sm ${index === loadingMessage ? "font-medium" : ""}`}>
                    {msg.text}
                  </span>
                  {index < loadingMessage && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
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
            exit={{ opacity: 0, scale: 1.2 }}
            className="space-y-6"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-foreground"
            >
              Your card is ready!
            </motion.p>

            {/* Card Pack */}
            <motion.div
              onClick={handlePackClick}
              className="relative w-72 h-96 mx-auto cursor-pointer"
              animate={{
                rotate: [-1, 1, -1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pack wrapper */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 shadow-2xl shadow-orange-500/50">
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                  {/* Holographic pattern */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 10px,
                          rgba(255,255,255,0.1) 10px,
                          rgba(255,255,255,0.1) 20px
                        )
                      `,
                    }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />

                  {/* PM Roast Logo */}
                  <div className="relative z-10 text-center">
                    <motion.div
                      className="text-6xl mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🔥
                    </motion.div>
                    <div className="font-black text-3xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                      PM ROAST
                    </div>
                    <p className="text-yellow-400/80 text-sm mt-2 font-medium">
                      Trading Card
                    </p>
                  </div>

                  {/* Sealed indicator */}
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                      <span className="text-yellow-400 text-xs font-semibold">SEALED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <motion.div
                className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 blur-xl -z-10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              Click to open your pack!
            </motion.p>
          </motion.div>
        )}

        {/* Opening Stage - Sparkles */}
        {stage === "opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            className="relative w-72 h-96 mx-auto"
          >
            {/* Exploding sparkles */}
            <div className="absolute inset-0">
              {sparkles.map((sparkle) => (
                <Sparkle key={sparkle.id} delay={sparkle.delay} x={sparkle.x} y={sparkle.y} />
              ))}
            </div>

            {/* Pack tearing apart */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500"
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [1, 1.1, 1.3],
                rotate: [0, 5, -5],
              }}
              transition={{ duration: 0.8 }}
            />

            {/* Flash effect */}
            <motion.div
              className="absolute inset-0 bg-white rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.2, 1] }}
            />
          </motion.div>
        )}

        {/* Revealed Stage - Card appears */}
        {stage === "revealed" && cardData && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.8,
            }}
            className="relative"
          >
            {/* Extra sparkles around card */}
            <motion.div
              className="absolute -inset-8 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {generateSparkles(20).map((sparkle) => (
                <motion.div
                  key={`reveal-${sparkle.id}`}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: sparkle.delay,
                    repeat: 2,
                  }}
                />
              ))}
            </motion.div>

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
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-lg font-semibold text-foreground"
            >
              You got: <span className="text-yellow-400">{cardData.archetypeName}</span>!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
