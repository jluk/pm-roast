"use client";

import { motion } from "framer-motion";
import { HoloCard } from "./HoloCard";

// Example card data showcasing different archetypes
const EXAMPLE_CARDS = [
  {
    score: 87,
    emoji: "🚀",
    name: "The Rocketship Rider",
    description: "Joined pre-IPO, rode the wave, now thinks they're a genius.",
    productSense: 82,
    execution: 91,
    leadership: 78,
  },
  {
    score: 64,
    emoji: "📊",
    name: "The Metric Monk",
    description: "Can quote every A/B test but hasn't talked to a user in months.",
    productSense: 58,
    execution: 85,
    leadership: 52,
  },
  {
    score: 73,
    emoji: "🎭",
    name: "The Feature Factory Survivor",
    description: "Ships fast, questions later. Has PTSD from roadmap reviews.",
    productSense: 68,
    execution: 88,
    leadership: 61,
  },
  {
    score: 91,
    emoji: "🧠",
    name: "The Strategic Visionary",
    description: "Actually gets it. Probably leaving for a founder role soon.",
    productSense: 94,
    execution: 85,
    leadership: 89,
  },
  {
    score: 55,
    emoji: "📝",
    name: "The PRD Perfectionist",
    description: "Documents everything, ships nothing. Confluence hall of fame.",
    productSense: 62,
    execution: 45,
    leadership: 58,
  },
  {
    score: 78,
    emoji: "🔥",
    name: "The Chaos Navigator",
    description: "Thrives in ambiguity. May or may not know what they're building.",
    productSense: 75,
    execution: 82,
    leadership: 71,
  },
];

function MiniCard({ card, index }: { card: typeof EXAMPLE_CARDS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <HoloCard>
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] border border-white/20">
          {/* Gold header */}
          <div className="h-7 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 flex items-center justify-center relative overflow-hidden">
            <span className="text-black text-[9px] font-black tracking-widest relative z-10">PM ROAST</span>
          </div>

          <div className="p-3">
            {/* Score + Emoji row */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-center">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#ff8c00]">
                  {card.score}
                </div>
                <span className="text-[8px] text-yellow-500/60 uppercase tracking-wider">Score</span>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30 border border-[#6366f1]/40 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-3xl">{card.emoji}</span>
              </div>
            </div>

            {/* Name */}
            <h3 className="text-sm font-bold text-white mb-1 leading-tight">
              {card.name}
            </h3>

            {/* Description */}
            <p className="text-[10px] text-gray-400 mb-2 line-clamp-2 leading-relaxed">
              {card.description}
            </p>

            {/* Stats */}
            <div className="flex justify-between text-[10px] py-2 px-2 bg-black/20 rounded-lg">
              <div className="text-center">
                <span className="block text-gray-500">🎯</span>
                <span className="text-[#6366f1] font-bold">{card.productSense}</span>
              </div>
              <div className="text-center">
                <span className="block text-gray-500">⚡</span>
                <span className="text-[#6366f1] font-bold">{card.execution}</span>
              </div>
              <div className="text-center">
                <span className="block text-gray-500">👥</span>
                <span className="text-[#6366f1] font-bold">{card.leadership}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="h-6 bg-gradient-to-r from-yellow-500/10 via-amber-400/15 to-yellow-500/10 border-t border-yellow-500/20 flex items-center justify-center">
            <span className="text-[8px] text-yellow-500/50 tracking-wider">pmroast.com</span>
          </div>
        </div>
      </HoloCard>
    </motion.div>
  );
}

export function ExampleGallery() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-20 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          What archetype are you?
        </h2>
        <p className="text-muted-foreground text-sm">
          Join thousands of PMs who&apos;ve discovered their true career identity
        </p>
      </motion.div>

      {/* Card Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        {EXAMPLE_CARDS.map((card, index) => (
          <MiniCard key={card.name} card={card} index={index} />
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <p className="text-sm text-muted-foreground">
          <span className="text-yellow-500 font-semibold">↑</span> Scroll up to get your card <span className="text-yellow-500 font-semibold">↑</span>
        </p>
      </motion.div>
    </section>
  );
}
