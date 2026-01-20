"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

  // Update the browser URL to the unique share URL (without page reload)
  // Also store the image in sessionStorage so it persists if the page is refreshed
  useEffect(() => {
    if (typeof window !== "undefined" && shareUrl) {
      // Extract the encoded data from the share URL to use as storage key
      const urlPath = shareUrl.replace(baseUrl, "");
      const encodedData = urlPath.replace("/share/", "");

      // Store the generated image in sessionStorage if available
      if (result.archetypeImage) {
        try {
          sessionStorage.setItem(`pm-roast-image-${encodedData}`, result.archetypeImage);
        } catch (e) {
          // Storage might be full or disabled, ignore
          console.warn("Could not store image in sessionStorage:", e);
        }
      }

      window.history.pushState({ path: urlPath }, "", urlPath);
    }
  }, [shareUrl, baseUrl, result.archetypeImage]);

  const shareToTwitter = () => {
    const archetype = stripMarkdown(result.archetype.name);
    const text = `Just got roasted by PM AI. I'm "${archetype}" with a ${result.careerScore}/100 career score. 💀\n\nGet your roast:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareToLinkedIn = () => {
    const archetype = stripMarkdown(result.archetype.name);
    const text = `I just got roasted by PM AI and discovered I'm "${archetype}" with a ${result.careerScore}/100 career score! 🔥

This AI career coach analyzes your PM profile and creates a personalized trading card based on your experience. It's brutally honest... but also gives you a roadmap to level up.

Get your PM card: ${shareUrl}

#ProductManagement #AI #CareerGrowth`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
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
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center lg:items-start justify-center">
        {/* Card - Full Size */}
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
            enableFlip
            enableModal
            userName={result.userName}
            bangerQuote={stripMarkdown(result.bangerQuote)}
          />
          <p className="text-xs text-muted-foreground">
            Click card to enlarge & flip
          </p>
        </motion.div>

        {/* Analysis Panel - Glassmorphism - Matched to card height */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex-1 w-full max-w-md space-y-5"
        >
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm text-white/50 uppercase tracking-widest">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full bg-green-500"
            />
            Analysis Complete
          </div>

          {/* Main panel with glow */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-60" />

            <div className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl space-y-5">
              {/* Rarity Badge */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-4xl">{rarityInfo.emoji}</span>
                <div>
                  <div className={`text-lg font-bold ${rarityInfo.color}`}>
                    {rarityInfo.label}
                  </div>
                  <div className="text-sm text-white/40">{rarityInfo.percentile} of PMs</div>
                </div>
              </div>

              {/* Career Score */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base text-white/50">Career Score</span>
                  <span className="font-mono font-bold text-3xl text-white">{result.careerScore}<span className="text-lg text-white/40">/100</span></span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.careerScore}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  />
                </div>
              </div>

              {/* Mini Roast Quote */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-base text-white/80 italic leading-relaxed">
                  &quot;{stripMarkdown(result.bangerQuote)}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Share to X - Primary CTA with hover preview */}
            <div className="relative group">
              <motion.button
                onClick={shareToTwitter}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share on X</span>
              </motion.button>

              {/* Tweet preview tooltip - appears below button on hover */}
              <div className="absolute top-full left-0 right-0 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none -translate-y-2 group-hover:translate-y-0 z-10">
                {/* Arrow pointing up */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-black/95 border-l border-t border-white/20 transform rotate-45" />
                <div className="p-4 rounded-xl bg-black/95 border border-white/20 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="w-5 h-5 text-white/60 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <p className="text-sm text-white/90 leading-relaxed">
                      Just got roasted by PM AI. I&apos;m &quot;{stripMarkdown(result.archetype.name)}&quot; with a {result.careerScore}/100 career score. 💀
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50 border-t border-white/10 pt-3">
                    <span className="px-2 py-0.5 rounded bg-white/10">Preview</span>
                    <span>Click button to post</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 h-10 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={onStartOver}
                className="flex-1 h-10 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* The Roast - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative"
      >
        {/* Glow background */}
        <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-50" />

        <div className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <span className="text-xl">🔥</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">The Roast</h3>
              <p className="text-xs text-white/50">Brutally honest observations</p>
            </div>
          </div>

          {/* Roast bullets */}
          <div className="space-y-3">
            {result.roastBullets.map((bullet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-lg shrink-0">
                  {index === 0 ? "💀" : index === 1 ? "😬" : index === 2 ? "💅" : "🎯"}
                </span>
                <p className="text-sm text-white/80 leading-relaxed">
                  {stripMarkdown(bullet)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Growth Plan - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative"
      >
        {/* Glow background */}
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50" />

        <div className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Your Growth Plan</h3>
              <p className="text-xs text-white/50">Gaps to address & roadmap to level up</p>
            </div>
          </div>

          {/* Gaps as pills */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Skill Gaps</p>
            <div className="flex flex-wrap gap-2">
              {result.gaps.map((gap, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-xs font-medium bg-orange-500/10 text-orange-300 border border-orange-500/20 rounded-full backdrop-blur-sm"
                >
                  {stripMarkdown(gap)}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

          {/* Roadmap */}
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40 mb-4">4-Phase Roadmap</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roadmapPhases.map((phase, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-[#6366f1] text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="font-medium text-white text-sm">{stripMarkdown(phase.title)}</p>
                  </div>
                  <ul className="space-y-1 ml-8">
                    {phase.actions.slice(0, 2).map((action, actionIndex) => (
                      <li key={actionIndex} className="text-xs text-white/60 flex gap-2">
                        <span className="text-[#6366f1] shrink-0">→</span>
                        <span>{stripMarkdown(action)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Required Listening - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="relative"
      >
        {/* Glow background */}
        <div className="absolute -inset-2 bg-gradient-to-r from-red-500/15 via-pink-500/15 to-red-500/15 rounded-2xl blur-xl opacity-50" />

        <div className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-xl">🎧</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Required Listening</h3>
              <p className="text-xs text-white/50">
                Episodes from{" "}
                <a
                  href="https://www.youtube.com/@LennysPodcast"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366f1] hover:underline"
                >
                  Lenny&apos;s Podcast
                </a>
              </p>
            </div>
          </div>

          {/* Episodes */}
          <div className="space-y-3">
            {result.podcastEpisodes.map((episode, index) => (
              <a
                key={index}
                href={getYouTubeSearchUrl(episode.title, episode.guest)}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all">
                  {/* YouTube icon */}
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm group-hover:text-[#6366f1] transition-colors">
                      {stripMarkdown(episode.title)}
                    </p>
                    <p className="text-xs text-white/50">with {stripMarkdown(episode.guest)}</p>
                    <p className="text-xs text-[#6366f1]/80 mt-1">{stripMarkdown(episode.reason)}</p>
                  </div>
                  <div className="flex items-center text-white/30 group-hover:text-[#6366f1] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
