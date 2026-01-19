"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RoastResult, DreamRole, DREAM_ROLES } from "@/lib/types";
import { generateShareUrl } from "@/lib/share";
import { InteractiveCard } from "@/components/InteractiveCard";
import { PMElement } from "@/components/PokemonCard";
import { getCardRarity, CardRarity } from "@/components/HoloCard";

// Rarity display info
const RARITY_INFO: Record<CardRarity, {
  label: string;
  emoji: string;
  color: string;
  description: string;
  percentile: string;
}> = {
  common: {
    label: "Common",
    emoji: "⚪",
    color: "text-gray-400",
    description: "You're just getting started. Everyone begins somewhere!",
    percentile: "Bottom 40%",
  },
  uncommon: {
    label: "Uncommon",
    emoji: "🔵",
    color: "text-blue-400",
    description: "Solid foundation. You're building real PM skills.",
    percentile: "Top 60%",
  },
  rare: {
    label: "Rare",
    emoji: "🟣",
    color: "text-purple-400",
    description: "Above average. You've got what it takes to level up.",
    percentile: "Top 40%",
  },
  ultra: {
    label: "Ultra Rare",
    emoji: "💗",
    color: "text-pink-400",
    description: "Impressive. You're in the upper echelon of PMs.",
    percentile: "Top 25%",
  },
  rainbow: {
    label: "Rainbow Rare",
    emoji: "🌈",
    color: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400",
    description: "Elite tier. Companies fight over PMs like you.",
    percentile: "Top 15%",
  },
  gold: {
    label: "Gold Crown",
    emoji: "👑",
    color: "text-yellow-400",
    description: "Legendary. You're the PM other PMs aspire to become.",
    percentile: "Top 5%",
  },
};

interface ResultsProps {
  result: RoastResult;
  dreamRole: DreamRole;
  onStartOver: () => void;
}

// Generate YouTube search URL for a podcast episode
function getYouTubeSearchUrl(title: string, guest: string): string {
  const query = `Lenny's Podcast ${guest} ${title}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

// Strip markdown formatting from text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')  // Remove bold **
    .replace(/\*/g, '')    // Remove italic *
    .replace(/_/g, '')     // Remove underscore emphasis
    .replace(/`/g, '')     // Remove code backticks
    .replace(/#{1,6}\s/g, '') // Remove headers
    .trim();
}

export function Results({ result, dreamRole, onStartOver }: ResultsProps) {
  const [copied, setCopied] = useState(false);

  // Generate the shareable URL
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = generateShareUrl(baseUrl, result, dreamRole);

  const shareToTwitter = () => {
    const archetype = stripMarkdown(result.archetype.name);
    const text = `Just got roasted by PM AI. I'm "${archetype}" with a ${result.careerScore}/100 career score. 💀\n\nGet your roast:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Only show first 4 roadmap phases
  const roadmapPhases = result.roadmap.slice(0, 4);

  // Get rarity info
  const rarity = getCardRarity(result.careerScore);
  const rarityInfo = RARITY_INFO[rarity];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto space-y-8 pb-12"
    >
      {/* Hero Section - Card + Analysis Panel Side by Side */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start justify-center">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="flex flex-col items-center gap-2 shrink-0"
        >
          <InteractiveCard
            score={result.careerScore}
            archetypeName={stripMarkdown(result.archetype.name)}
            archetypeEmoji={result.archetype.emoji}
            archetypeDescription={stripMarkdown(result.archetype.description)}
            archetypeImage={result.archetypeImage}
            element={(result.archetype.element as PMElement) || "chaos"}
            moves={result.moves || []}
            stage={result.archetype.stage || "Senior"}
            weakness={result.archetype.weakness || "Meetings"}
            flavor={stripMarkdown(result.archetype.flavor || result.archetype.description)}
            compact
            enableFlip
            enableModal
          />
          <p className="text-xs text-muted-foreground">
            Click card to enlarge & flip
          </p>
        </motion.div>

        {/* Analysis Panel - Futuristic Style */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex-1 max-w-sm space-y-6"
        >
          {/* Scanning Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
              Analysis Complete
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
                {rarityInfo.description}
              </p>
            </div>
          </div>

          {/* Score + Mini Roast */}
          <div className="p-4 rounded-lg border border-border/50 bg-card/30">
            {/* Career Score */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Career Score</span>
                <span className="font-mono font-bold text-lg">{result.careerScore}/100</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.careerScore}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
            </div>

            {/* Mini Roast Quote */}
            <div className="pt-3 border-t border-border/50">
              <p className="text-sm text-gray-300 italic leading-relaxed">
                &quot;{stripMarkdown(result.bangerQuote)}&quot;
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Share to X - Primary CTA with animated gradient border */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Animated gradient border */}
              <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-75 group-hover:opacity-100 blur-sm transition-opacity" />
              <motion.div
                className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 200%" }}
              />
              {/* Button content */}
              <button
                onClick={shareToTwitter}
                className="relative w-full h-14 px-6 rounded-xl bg-black text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-neutral-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share Your Card on X</span>
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </motion.div>
            <div className="flex gap-2">
              <Button
                onClick={copyLink}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                onClick={onStartOver}
                variant="outline"
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Card
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* The Roast - Fiery Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative"
      >
        {/* Fire glow background */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 rounded-3xl blur-xl" />

        <div className="relative">
          {/* Header with fire animation */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-3xl"
            >
              🔥
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                The Roast
              </h3>
              <p className="text-xs text-muted-foreground">Brutally honest observations</p>
            </div>
          </div>

          {/* Roast card with fire border */}
          <div className="relative">
            {/* Animated fire border */}
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 opacity-60" />
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-orange-500/50 to-transparent opacity-40" />

            <Card className="relative p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 border-0">
              {/* Inner fire accent line */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

              <div className="space-y-4">
                {result.roastBullets.map((bullet, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.15 }}
                    className="flex gap-4 items-start group"
                  >
                    <motion.span
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.9, 1.1, 0.9],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                      className="text-2xl shrink-0 mt-0.5"
                    >
                      {index === 0 ? "💀" : index === 1 ? "😬" : index === 2 ? "💅" : "🎯"}
                    </motion.span>
                    <p className="text-base text-gray-200 leading-relaxed group-hover:text-white transition-colors">
                      {stripMarkdown(bullet)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Gap Analysis - Numbered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <span>📊</span> What&apos;s Missing
        </h3>
        <Card className="p-6 border-orange-500/20 bg-orange-500/5">
          <div className="space-y-4">
            {result.gaps.map((gap, index) => (
              <div key={index} className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </span>
                <p className="text-base text-gray-200 pt-0.5">{stripMarkdown(gap)}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Roadmap - 4 Phases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <span>🗺️</span> Your Roadmap to Top 1%
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roadmapPhases.map((phase, index) => (
            <Card key={index} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#6366f1] font-bold text-sm">P{index + 1}</span>
                </div>
                <p className="font-semibold text-white text-sm">{stripMarkdown(phase.title)}</p>
              </div>
              <ul className="space-y-2">
                {phase.actions.slice(0, 2).map((action, actionIndex) => (
                  <li key={actionIndex} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-[#6366f1] shrink-0">→</span>
                    <span>{stripMarkdown(action)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Recommended Episodes - Clickable with Thumbnails */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-white">
          <span>🎧</span> Required Listening
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Episodes from{" "}
          <a
            href="https://www.youtube.com/@LennysPodcast"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6366f1] hover:underline"
          >
            Lenny&apos;s Podcast
          </a>
          {" "}to level up your PM game
        </p>
        <div className="grid gap-3">
          {result.podcastEpisodes.map((episode, index) => (
            <a
              key={index}
              href={getYouTubeSearchUrl(episode.title, episode.guest)}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="p-4 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all cursor-pointer">
                <div className="flex gap-4">
                  {/* YouTube Thumbnail Placeholder */}
                  <div className="w-24 h-16 bg-red-600/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-600/30 transition-colors">
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white group-hover:text-[#6366f1] transition-colors">
                      {stripMarkdown(episode.title)}
                    </p>
                    <p className="text-sm text-gray-400">with {stripMarkdown(episode.guest)}</p>
                    <p className="text-sm text-[#6366f1] mt-1">{stripMarkdown(episode.reason)}</p>
                  </div>
                  <div className="flex items-center text-gray-500 group-hover:text-[#6366f1] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
