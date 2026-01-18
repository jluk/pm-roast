"use client";

import { motion } from "framer-motion";
import { PMElement, PMMove } from "./PokemonCard";
import { InteractiveCard } from "./InteractiveCard";

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
      { name: "Exit Interview", energyCost: 3, damage: 80 },
    ],
    flavor: "Often found mentioning their employee number. Peaked in 2021.",
    productSense: 72,
    execution: 91,
    leadership: 68,
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
      { name: "P-Value Punch", energyCost: 3, damage: 70 },
    ],
    flavor: "Natural habitat: Looker dashboard. Strong opinions on sample sizes.",
    productSense: 58,
    execution: 85,
    leadership: 42,
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
      { name: "Burnout Blast", energyCost: 3, damage: 90 },
    ],
    flavor: "Twitches at 'quick sync'. Shipped 200 features nobody uses.",
    productSense: 58,
    execution: 88,
    leadership: 51,
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
      { name: "Market Maker", energyCost: 3, damage: 100 },
    ],
    flavor: "Rare PM who thinks AND executes. Handle with care - they have options.",
    productSense: 94,
    execution: 85,
    leadership: 89,
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
      { name: "Analysis Paralysis", energyCost: 3, damage: 60 },
    ],
    flavor: "Written more words than shipped features. Their PRDs have PRDs.",
    productSense: 62,
    execution: 35,
    leadership: 48,
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
      { name: "Controlled Burn", energyCost: 3, damage: 85 },
    ],
    flavor: "Turns every fire into opportunity. Calendar is 90% 'quick syncs'.",
    productSense: 75,
    execution: 82,
    leadership: 71,
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
      { name: "Happy Path Only", energyCost: 3, damage: 75 },
    ],
    flavor: "Demo environment: perfect. Prod: 47 Jira tickets. Every time.",
    productSense: 70,
    execution: 65,
    leadership: 85,
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
      { name: "LLM Integration", energyCost: 3, damage: 70 },
    ],
    flavor: "Every solution involves an LLM. Even the login page. Why not?",
    productSense: 60,
    execution: 72,
    leadership: 65,
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
      { name: "Culture Shock", energyCost: 3, damage: 80 },
    ],
    flavor: "Still refers to levels. Adjusting to life without design systems.",
    productSense: 78,
    execution: 70,
    leadership: 74,
  },
];

function GalleryCard({ card, index }: { card: typeof EXAMPLE_CARDS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="flex justify-center"
    >
      <InteractiveCard
        score={card.score}
        archetypeName={card.name}
        archetypeEmoji={card.emoji}
        archetypeDescription={card.description}
        element={card.element}
        stage={card.stage}
        weakness={card.weakness}
        moves={card.moves}
        flavor={card.flavor}
        compact
        enableFlip
        enableModal
      />
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
