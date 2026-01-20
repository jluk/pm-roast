"use client";

import { motion } from "framer-motion";
import { PMElement, PMMove } from "./PokemonCard";
import { InteractiveCard } from "./InteractiveCard";
import { getCardRarity } from "./HoloCard";

// Example card data showcasing different PM archetypes - 9 cards for 3x3 grid
// Internet humor meets tech culture - unhinged but relatable PM energy
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
    name: "Ship Lord",
    description: "Cuts scope on Monday. Ships on Friday. Lives in launch reviews.",
    element: "shipping",
    stage: "Staff",
    weakness: "Polish",
    moves: [
      { name: "Descope", energyCost: 1, damage: 40, effect: "Cut 3 features to hit deadline." },
      { name: "Launch Anyway", energyCost: 2, damage: 55, effect: "Ship with known issues. Fix in v2." },
    ],
    flavor: "'Perfect is the enemy of shipped' is their desktop wallpaper.",
    productSense: 72,
    execution: 95,
    leadership: 68,
    archetypeImage: "/cards/rocketship-rider.png",
  },
  {
    score: 64,
    emoji: "📊",
    name: "Metric Demon",
    description: "Can't make a decision without 12 dashboards. Statistical significance is a lifestyle.",
    element: "data",
    stage: "Senior",
    weakness: "Intuition",
    moves: [
      { name: "But The Data", energyCost: 1, damage: 20, effect: "Veto any decision with vibes." },
      { name: "Sample Size", energyCost: 2, damage: 40, effect: "Delay launch by 3 weeks." },
    ],
    flavor: "Patagonia vest is load-bearing. Has opinions about Mixpanel vs Amplitude.",
    productSense: 58,
    execution: 85,
    leadership: 42,
    archetypeImage: "/cards/metric-monk.png",
  },
  {
    score: 73,
    emoji: "🔥",
    name: "This Is Fine",
    description: "Everything's on fire. Still hitting deadlines. One eye twitching.",
    element: "chaos",
    stage: "Mid-Level",
    weakness: "Boundaries",
    moves: [
      { name: "@channel", energyCost: 1, damage: 25, effect: "Panic ping at 11pm." },
      { name: "War Room", energyCost: 2, damage: 50, effect: "Turn any bug into an incident." },
    ],
    flavor: "Has typed 'sounds good!' while crying. Multiple times today.",
    productSense: 58,
    execution: 88,
    leadership: 51,
    archetypeImage: "/cards/factory-survivor.png",
  },
  {
    score: 91,
    emoji: "✨",
    name: "Vision Quest",
    description: "Gestures at blank slides labeled 'THE FUTURE'. Investors love it anyway.",
    element: "vision",
    stage: "Principal",
    weakness: "Details",
    moves: [
      { name: "Disruption", energyCost: 2, damage: 55, effect: "Rebrand pivot as innovation." },
      { name: "North Star", energyCost: 2, damage: 60, effect: "Align team to vibes only." },
    ],
    flavor: "Has a turtleneck for every day of the week. Disrupts at brunch.",
    productSense: 94,
    execution: 75,
    leadership: 92,
    archetypeImage: "/cards/strategic-visionary.png",
  },
  {
    score: 55,
    emoji: "📝",
    name: "PRD Goblin",
    description: "30-slide deck for every decision. Presenting to empty room. Again.",
    element: "strategy",
    stage: "Senior",
    weakness: "Shipping",
    moves: [
      { name: "Actually...", energyCost: 1, damage: 15, effect: "Find edge case nobody asked about." },
      { name: "Appendix", energyCost: 2, damage: 35, effect: "Add 15 pages of backup slides." },
    ],
    flavor: "Their PRDs have PRDs. Confluence is their love language.",
    productSense: 70,
    execution: 35,
    leadership: 48,
    archetypeImage: "/cards/prd-perfectionist.png",
  },
  {
    score: 78,
    emoji: "🌀",
    name: "Pivot Master",
    description: "Changes direction mid-sentence. 73 browser tabs. Chaos is a ladder.",
    element: "chaos",
    stage: "Lead",
    weakness: "Focus",
    moves: [
      { name: "New Strategy", energyCost: 1, damage: 30, effect: "Invalidate last week's work." },
      { name: "Reprioritize", energyCost: 2, damage: 50, effect: "Move goalposts mid-sprint." },
    ],
    flavor: "Thrives in ambiguity. Jira board is abstract art at this point.",
    productSense: 75,
    execution: 82,
    leadership: 71,
    archetypeImage: "/cards/chaos-navigator.png",
  },
  {
    score: 82,
    emoji: "🎭",
    name: "Stakeholder Whisperer",
    description: "Knows everyone's agenda. Taking notes on both sides. Pure strategy.",
    element: "politics",
    stage: "Staff",
    weakness: "Authenticity",
    moves: [
      { name: "Let's Align", energyCost: 1, damage: 35, effect: "Schedule meeting about meeting." },
      { name: "Per My Last", energyCost: 2, damage: 55, effect: "Passive aggressive with receipts." },
    ],
    flavor: "Feedback sandwich expert. Has the org chart memorized. Knows the drama.",
    productSense: 70,
    execution: 65,
    leadership: 88,
    archetypeImage: "/cards/demo-wizard.png",
  },
  {
    score: 68,
    emoji: "🤖",
    name: "AI Pilled",
    description: "Added LLM to the login page. Every PRD mentions GenAI. It's a vibe.",
    element: "vision",
    stage: "Junior",
    weakness: "Fundamentals",
    moves: [
      { name: "What If AI", energyCost: 1, damage: 25, effect: "Derail any feature discussion." },
      { name: "GPT Wrapper", energyCost: 2, damage: 45, effect: "Call it a platform play." },
    ],
    flavor: "Subscribed to 50 AI newsletters. ChatGPT is their therapist.",
    productSense: 60,
    execution: 72,
    leadership: 65,
    archetypeImage: "/cards/ai-bandwagoner.png",
  },
  {
    score: 76,
    emoji: "☕",
    name: "Ex-FAANG Energy",
    description: "Left Google. Still refers to levels. Misses the free food daily.",
    element: "shipping",
    stage: "L6 Equivalent",
    weakness: "Scrappiness",
    moves: [
      { name: "At Scale", energyCost: 1, damage: 20, effect: "Overengineer a landing page." },
      { name: "Back At G", energyCost: 2, damage: 45, effect: "Derail with irrelevant context." },
    ],
    flavor: "Adjusting to life without a design system. It's been rough.",
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
      {/* Special glow effect for ultra rare+ cards - pointer-events-none so clicks pass through */}
      {isUltraRare && (
        <motion.div
          className={`absolute -inset-4 rounded-3xl blur-2xl pointer-events-none ${
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

      {/* Sparkle effects for rainbow/gold cards - pointer-events-none so clicks pass through */}
      {isRainbowOrGold && (
        <div className="pointer-events-none">
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
        </div>
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
