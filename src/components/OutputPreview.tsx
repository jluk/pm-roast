"use client";

import { motion } from "framer-motion";
import { PokemonCard, PMElement } from "./PokemonCard";

// Sample data - the "Your PM Card" preview style
const SAMPLE_RESULT = {
  score: 85,
  archetypeName: "Your PM Card",
  archetypeEmoji: "🎯",
  archetypeDescription: "Discover your PM archetype and get roasted by AI.",
  element: "vision" as PMElement,
  stage: "???",
  weakness: "???",
  moves: [
    { name: "Get Roasted", energyCost: 1, damage: 99, effect: "Reveal your true PM nature." },
    { name: "Share Results", energyCost: 2, damage: 50, effect: "Flex on LinkedIn." },
  ],
};

export function OutputPreview() {
  return (
    <section className="mt-24 w-full max-w-5xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          See What You&apos;ll Get
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          A personalized PM trading card with brutally honest analysis and career insights.
        </p>
      </motion.div>

      {/* Preview Layout - Card + Analysis Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center"
      >
        {/* Card Preview */}
        <div className="relative shrink-0">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
          <div className="relative">
            <PokemonCard
              score={SAMPLE_RESULT.score}
              archetypeName={SAMPLE_RESULT.archetypeName}
              archetypeEmoji={SAMPLE_RESULT.archetypeEmoji}
              archetypeDescription={SAMPLE_RESULT.archetypeDescription}
              element={SAMPLE_RESULT.element}
              moves={SAMPLE_RESULT.moves}
              stage={SAMPLE_RESULT.stage}
              weakness={SAMPLE_RESULT.weakness}
              compact
            />
          </div>
        </div>

        {/* Analysis Panel Preview - Compact */}
        <div className="flex-1 max-w-xs space-y-3">
          {/* What's included header */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            Your Analysis Includes
          </div>

          {/* Features List - Compact */}
          <div className="space-y-2">
            <FeatureItem
              emoji="🔥"
              title="The Roast"
              description="Brutally honest observations"
            />
            <FeatureItem
              emoji="📊"
              title="Gap Analysis"
              description="What's missing from your profile"
            />
            <FeatureItem
              emoji="🗺️"
              title="Career Roadmap"
              description="Path to your dream role"
            />
            <FeatureItem
              emoji="🎧"
              title="Required Listening"
              description="Lenny's Podcast episodes"
            />
            <FeatureItem
              emoji="💬"
              title="Shareable Quote"
              description="Tweet-worthy roast to share"
            />
          </div>

          {/* CTA hint */}
          <p className="text-center text-xs text-muted-foreground pt-1">
            Ready in ~15 seconds
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function FeatureItem({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <span className="text-xl shrink-0">{emoji}</span>
      <div>
        <p className="font-medium text-sm text-white">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
