"use client";

import { motion } from "framer-motion";
import { PMElement, PMMove } from "./PokemonCard";
import { InteractiveCard } from "./InteractiveCard";
import { getCardRarity } from "./HoloCard";

// Example card data showcasing different PM archetypes - 9 cards for 3x3 grid
const EXAMPLE_CARDS: {
  score: number;
  emoji: string;
  name: string;
  description: string;
  element: PMElement;
  stage: string;
  weakness: string;
  moves: PMMove[];
  flavor: string;
  productSense: number;
  execution: number;
  leadership: number;
  archetypeImage?: string; // Custom generated image URL
}[] = [
  {
    score: 87,
    emoji: "🚀",
    name: "Rocketship Rider",
    description: "Joined pre-IPO, rode the wave, now thinks they're a genius.",
    element: "shipping",
    stage: "Staff",
    weakness: "Humility",
    moves: [
      { name: "Equity Flex", energyCost: 1, damage: 30, effect: "Show off vested shares." },
      { name: "Lucky Timing", energyCost: 2, damage: 50, effect: "Claim credit for market conditions." },
    ],
    flavor: "Often found mentioning their employee number. Peaked in 2021.",
    productSense: 72,
    execution: 91,
    leadership: 68,
    archetypeImage: "/cards/rocketship-rider.png",
  },
  {
    score: 64,
    emoji: "📊",
    name: "Metric Monk",
    description: "Can quote every A/B test but hasn't talked to a user in months.",
    element: "data",
    stage: "Senior",
    weakness: "Users",
    moves: [
      { name: "Dashboard Stare", energyCost: 1, damage: 20, effect: "Confuse with 47 metrics." },
      { name: "Stat Significance", energyCost: 2, damage: 40, effect: "Delay decision 2 weeks." },
    ],
    flavor: "Natural habitat: Looker dashboard. Strong opinions on sample sizes.",
    productSense: 58,
    execution: 85,
    leadership: 42,
    archetypeImage: "/cards/metric-monk.png",
  },
  {
    score: 73,
    emoji: "🎭",
    name: "Factory Survivor",
    description: "Ships fast, questions later. Has PTSD from roadmap reviews.",
    element: "chaos",
    stage: "Mid-Level",
    weakness: "Planning",
    moves: [
      { name: "Scope Creep", energyCost: 1, damage: 25, effect: "Add 3 requirements mid-sprint." },
      { name: "Deadline Dodge", energyCost: 2, damage: 45, effect: "Push launch back 1 week." },
    ],
    flavor: "Twitches at 'quick sync'. Shipped 200 features nobody uses.",
    productSense: 58,
    execution: 88,
    leadership: 51,
    archetypeImage: "/cards/factory-survivor.png",
  },
  {
    score: 91,
    emoji: "🧠",
    name: "Strategic Visionary",
    description: "Actually gets it. Probably leaving for a founder role soon.",
    element: "vision",
    stage: "Principal",
    weakness: "Patience",
    moves: [
      { name: "First Principles", energyCost: 2, damage: 50, effect: "Reframe entire problem." },
      { name: "Investor Pitch", energyCost: 2, damage: 60, effect: "Secure funding with napkin math." },
    ],
    flavor: "Rare PM who thinks AND executes. Handle with care - they have options.",
    productSense: 94,
    execution: 85,
    leadership: 89,
    archetypeImage: "/cards/strategic-visionary.png",
  },
  {
    score: 55,
    emoji: "📝",
    name: "PRD Perfectionist",
    description: "Documents everything, ships nothing. Confluence hall of fame.",
    element: "strategy",
    stage: "Senior",
    weakness: "Shipping",
    moves: [
      { name: "Doc Block", energyCost: 1, damage: 15, effect: "Paralyze team with 50-page PRD." },
      { name: "Edge Case Spiral", energyCost: 2, damage: 35, effect: "Discover 12 new blockers." },
    ],
    flavor: "Written more words than shipped features. Their PRDs have PRDs.",
    productSense: 62,
    execution: 35,
    leadership: 48,
    archetypeImage: "/cards/prd-perfectionist.png",
  },
  {
    score: 78,
    emoji: "🔥",
    name: "Chaos Navigator",
    description: "Thrives in ambiguity. May or may not know what they're building.",
    element: "chaos",
    stage: "Lead",
    weakness: "Structure",
    moves: [
      { name: "Pivot Strike", energyCost: 1, damage: 30, effect: "Change direction mid-sprint." },
      { name: "Stakeholder Shuffle", energyCost: 2, damage: 50, effect: "Realign priorities overnight." },
    ],
    flavor: "Turns every fire into opportunity. Calendar is 90% 'quick syncs'.",
    productSense: 75,
    execution: 82,
    leadership: 71,
    archetypeImage: "/cards/chaos-navigator.png",
  },
  {
    score: 82,
    emoji: "🎪",
    name: "Demo Wizard",
    description: "Every demo is flawless. Production is another story entirely.",
    element: "politics",
    stage: "Staff",
    weakness: "Reality",
    moves: [
      { name: "Smoke & Mirrors", energyCost: 1, damage: 35, effect: "Hide bugs during demo." },
      { name: "Exec Dazzle", energyCost: 2, damage: 55, effect: "Secure budget with vibes." },
    ],
    flavor: "Demo environment: perfect. Prod: 47 Jira tickets. Every time.",
    productSense: 70,
    execution: 65,
    leadership: 85,
    archetypeImage: "/cards/demo-wizard.png",
  },
  {
    score: 68,
    emoji: "🤖",
    name: "AI Bandwagoner",
    description: "Added 'AI-powered' to every PRD since ChatGPT launched.",
    element: "vision",
    stage: "Junior",
    weakness: "Fundamentals",
    moves: [
      { name: "Buzzword Blast", energyCost: 1, damage: 25, effect: "Confuse with jargon." },
      { name: "GenAI Pivot", energyCost: 2, damage: 45, effect: "Rebrand existing feature as AI." },
    ],
    flavor: "Every solution involves an LLM. Even the login page. Why not?",
    productSense: 60,
    execution: 72,
    leadership: 65,
    archetypeImage: "/cards/ai-bandwagoner.png",
  },
  {
    score: 76,
    emoji: "☕",
    name: "FAANG Escapee",
    description: "Left big tech for startup life. Misses free food daily.",
    element: "shipping",
    stage: "L6 Equivalent",
    weakness: "Scrappiness",
    moves: [
      { name: "Process Import", energyCost: 1, damage: 20, effect: "Introduce 6 new meetings." },
      { name: "Scale Story", energyCost: 2, damage: 45, effect: "Mention previous MAUs." },
    ],
    flavor: "Still refers to levels. Adjusting to life without design systems.",
    productSense: 78,
    execution: 70,
    leadership: 74,
    archetypeImage: "/cards/faang-escapee.png",
  },
];

function GalleryCard({ card, index }: { card: typeof EXAMPLE_CARDS[0]; index: number }) {
  const rarity = getCardRarity(card.score);
  const isUltraRare = rarity === "ultra" || rarity === "rainbow" || rarity === "gold";
  const isRainbowOrGold = rarity === "rainbow" || rarity === "gold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="flex justify-center relative"
    >
      {/* Special glow effect for ultra rare+ cards */}
      {isUltraRare && (
        <motion.div
          className={`absolute -inset-4 rounded-3xl blur-2xl ${
            isRainbowOrGold
              ? "bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-cyan-500/40"
              : "bg-pink-500/30"
          }`}
          animate={isRainbowOrGold ? {
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Sparkle effects for rainbow/gold cards */}
      {isRainbowOrGold && (
        <>
          <motion.div
            className="absolute -top-2 -left-2 w-3 h-3 bg-white rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="absolute top-1/4 -right-3 w-2 h-2 bg-yellow-300 rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute -bottom-1 left-1/4 w-2 h-2 bg-cyan-300 rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 -left-3 w-2 h-2 bg-pink-300 rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.75,
            }}
          />
        </>
      )}

      <div className="relative z-10">
        <InteractiveCard
          score={card.score}
          archetypeName={card.name}
          archetypeEmoji={card.emoji}
          archetypeDescription={card.description}
          archetypeImage={card.archetypeImage}
          element={card.element}
          stage={card.stage}
          weakness={card.weakness}
          moves={card.moves}
          flavor={card.flavor}
          compact
          enableFlip
          enableModal
        />
      </div>
    </motion.div>
  );
}

export function ExampleGallery() {
  return (
    <section className="w-full max-w-7xl mx-auto mt-24 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-3">
          What archetype are you?
        </h2>
        <p className="text-muted-foreground text-base">
          Join thousands of PMs who&apos;ve discovered their true career identity
        </p>
      </motion.div>

      {/* 3x3 Card Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {EXAMPLE_CARDS.map((card, index) => (
          <GalleryCard key={card.name} card={card} index={index} />
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12 space-y-3"
      >
        <p className="text-sm text-muted-foreground">
          <span className="text-yellow-400">Click any card</span> to enlarge and flip
        </p>
        <p className="text-base text-muted-foreground">
          <span className="text-yellow-500 font-semibold">↑</span> Scroll up to get your card <span className="text-yellow-500 font-semibold">↑</span>
        </p>
      </motion.div>
    </section>
  );
}
