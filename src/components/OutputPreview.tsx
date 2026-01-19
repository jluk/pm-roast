"use client";

import { motion } from "framer-motion";
import { PokemonCard, PMElement } from "./PokemonCard";
import { getCardRarity, CardRarity } from "./HoloCard";

// Sample data for the preview
const SAMPLE_RESULT = {
  score: 78,
  archetypeName: "Shipping Sensei",
  archetypeEmoji: "🚀",
  archetypeDescription: "Deploys to prod on Fridays. No fear, only features.",
  element: "shipping" as PMElement,
  stage: "Senior",
  weakness: "Docs",
  moves: [
    { name: "Ship It", energyCost: 1, damage: 45, effect: "Bypasses all blockers" },
    { name: "Scope Cut", energyCost: 2, damage: 70, effect: "Removes 80% of features" },
  ],
  bangerQuote: "Your deployment frequency gives DevOps anxiety, but your users love you for it.",
};

// Rarity display info (simplified version from Results)
const RARITY_INFO: Record<CardRarity, {
  label: string;
  emoji: string;
  color: string;
  percentile: string;
}> = {
  common: { label: "Common", emoji: "⚪", color: "text-gray-400", percentile: "Bottom 40%" },
  uncommon: { label: "Uncommon", emoji: "🔵", color: "text-blue-400", percentile: "Top 60%" },
  rare: { label: "Rare", emoji: "🟣", color: "text-purple-400", percentile: "Top 40%" },
  ultra: { label: "Ultra Rare", emoji: "💗", color: "text-pink-400", percentile: "Top 25%" },
  rainbow: { label: "Rainbow Rare", emoji: "🌈", color: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400", percentile: "Top 15%" },
  gold: { label: "Gold Crown", emoji: "👑", color: "text-yellow-400", percentile: "Top 5%" },
};

export function OutputPreview() {
  const rarity = getCardRarity(SAMPLE_RESULT.score);
  const rarityInfo = RARITY_INFO[rarity];

  return (
    <section className="mt-24 w-full max-w-5xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          See What You&apos;ll Get
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A personalized PM trading card with brutally honest analysis,
          career insights, and shareable results.
        </p>
      </motion.div>

      {/* Preview Layout - Card + Analysis Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center"
      >
        {/* Card Preview */}
        <div className="relative shrink-0">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
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

        {/* Analysis Panel Preview */}
        <div className="flex-1 max-w-sm space-y-6">
          {/* What's included header */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Your Analysis Includes
          </div>

          {/* Rarity Badge */}
          <div className="p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{rarityInfo.emoji}</span>
              <div>
                <div className={`text-lg font-bold ${rarityInfo.color}`}>
                  {rarityInfo.label}
                </div>
                <div className="text-xs text-muted-foreground">{rarityInfo.percentile} of PMs</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Card rarity based on your career score
            </p>
          </div>

          {/* Score + Quote */}
          <div className="p-4 rounded-lg border border-border/50 bg-card/30">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Career Score</span>
                <span className="font-mono font-bold text-lg">{SAMPLE_RESULT.score}/100</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${SAMPLE_RESULT.score}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-border/50">
              <p className="text-sm text-gray-300 italic leading-relaxed">
                &quot;{SAMPLE_RESULT.bangerQuote}&quot;
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <FeatureItem
              emoji="🔥"
              title="The Roast"
              description="Brutally honest observations about your PM style"
            />
            <FeatureItem
              emoji="📊"
              title="Gap Analysis"
              description="What's missing from your experience"
            />
            <FeatureItem
              emoji="🗺️"
              title="Roadmap"
              description="Personalized path to your dream role"
            />
            <FeatureItem
              emoji="🎧"
              title="Required Listening"
              description="Podcast episodes to level up"
            />
          </div>

          {/* CTA hint */}
          <p className="text-center text-sm text-muted-foreground pt-2">
            Get your personalized card in ~15 seconds
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
