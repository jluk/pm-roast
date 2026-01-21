"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RoastResult, DreamRole, DREAM_ROLES } from "@/lib/types";
import { generateShareUrl } from "@/lib/share";
import { PokemonCard, PMElement } from "@/components/PokemonCard";
import { CardBack } from "@/components/CardBack";
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
  isSharePage?: boolean;
  cardId?: string;
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

export function Results({ result, dreamRole, onStartOver, isSharePage = false, cardId }: ResultsProps) {
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate the shareable URL - prefer cardId if available (permanent storage)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = cardId
    ? `${baseUrl}/card/${cardId}`
    : generateShareUrl(baseUrl, result, dreamRole);

  // Update the browser URL to the shareable URL (without page reload)
  // Skip this on the share page since we're already on the share URL
  useEffect(() => {
    if (typeof window !== "undefined" && shareUrl && !isSharePage) {
      const urlPath = cardId ? `/card/${cardId}` : shareUrl.replace(baseUrl, "");
      window.history.pushState({ path: urlPath }, "", urlPath);
    }
  }, [shareUrl, baseUrl, isSharePage, cardId]);

  const shareToTwitter = () => {
    const archetype = stripMarkdown(result.archetype.name);
    const rarity = getCardRarity(result.careerScore);
    const rarityLabel = RARITY_INFO[rarity].label;
    const text = `PM Roast said I'm a "${archetype}" (${rarityLabel} card)\n\n"${result.bangerQuote}"\n\nBrutal but fair. What's your PM archetype?`;
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

  const downloadCard = async () => {
    // Use the OG image endpoint to get a shareable card image
    const ogUrl = `${baseUrl}/api/og?name=${encodeURIComponent(result.userName || 'PM')}&archetype=${encodeURIComponent(stripMarkdown(result.archetype.name))}&score=${result.careerScore}&rarity=${rarity}`;

    try {
      const response = await fetch(ogUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pm-roast-${(result.userName || 'card').toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open OG image in new tab
      window.open(ogUrl, '_blank');
    }
  };

  // Only show first 4 roadmap phases
  const roadmapPhases = result.roadmap.slice(0, 4);

  // Get rarity info
  const rarity = getCardRarity(result.careerScore);
  const rarityInfo = RARITY_INFO[rarity];

  // Go straight to full results - no multi-step reveal
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Hero Section - Card + Bento boxes - matches ExpandedCardView layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        {/* Left: Flippable Card - Fixed width on desktop with overflow visible for hover effects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="flex flex-col items-center w-full lg:w-[420px] shrink-0 overflow-visible"
        >
          {/* Flippable Card Container - overflow-visible prevents hover clipping */}
          <div
            className="cursor-pointer isolate overflow-visible"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              perspective: "1000px",
              width: 400,
              height: 560,
            }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                transformStyle: "preserve-3d",
                willChange: "transform",
                width: "100%",
                height: "100%",
              }}
              className="relative isolate"
            >
              {/* Front of card */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <PokemonCard
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
                  userName={result.userName}
                />
              </div>

              {/* Back of card */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <CardBack
                  rarity={rarity}
                  roastSummary={{
                    archetypeName: stripMarkdown(result.archetype.name),
                    score: result.careerScore,
                    bangerQuote: stripMarkdown(result.bangerQuote),
                    userName: result.userName,
                    element: result.archetype.element,
                    naturalRival: result.naturalRival,
                  }}
                />
              </div>
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Click card to flip
          </p>
        </motion.div>

        {/* Right: Bento Glass Tiles - justify-between for flush alignment with card */}
        <div className="flex flex-col gap-3 w-full lg:flex-1 lg:h-[560px] lg:justify-between">
          {/* The Roast - Combined banger quote + roast bullets */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className="relative group flex-1 min-h-0"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative h-full rounded-2xl bg-black/40 backdrop-blur-xl border border-orange-500/20 shadow-xl overflow-hidden flex flex-col">
              {/* Singed gradient accent line */}
              <div className="h-[2px] bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 shrink-0" />

              <div className="p-4 flex-1 overflow-y-auto min-h-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500/30 to-red-600/30 flex items-center justify-center border border-orange-500/30">
                    <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.5 1.5-4.5 3-6.5s3-4.5 3-7.5c0 0 1 2 2 4 .5-1 1-2 1-3 2.5 3.5 5 6.5 5 13 0 3.866-3.134 7-7 7zm0-2c2.761 0 5-2.239 5-5 0-2.5-1.5-5-3-7-.5 1-1 2-2 3-.5-1-1-2-1.5-3-1 1.5-2.5 3.5-2.5 7 0 2.761 2.239 5 5 5z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-white">The Roast</h3>
                </div>

                {/* Banger Quote */}
                <div className="flex items-start gap-2 mb-4 p-2 rounded-lg bg-white/[0.03]">
                  <svg className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                  </svg>
                  <p className="text-sm text-white/90 font-medium leading-relaxed">
                    {stripMarkdown(result.bangerQuote)}
                  </p>
                </div>

                {/* Roast bullets */}
                <div className="space-y-2">
                  {result.roastBullets.slice(1).map((bullet, index) => {
                    const heatLevel = index === 0 ? 3 : index === 1 ? 2 : 1;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex gap-2 items-start p-2 rounded-lg hover:bg-white/[0.02] transition-all duration-300"
                      >
                        {/* Heat Meter - compact */}
                        <div className="flex flex-col gap-0.5 shrink-0 mt-1">
                          {[3, 2, 1].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-1 rounded-sm transition-all ${
                                level <= heatLevel
                                  ? level === 3
                                    ? "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"
                                    : level === 2
                                      ? "bg-orange-500 shadow-[0_0_3px_rgba(249,115,22,0.5)]"
                                      : "bg-amber-500"
                                  : "bg-zinc-700/50"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-300/90 leading-relaxed">
                          {stripMarkdown(bullet)}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Natural Rival */}
                {result.naturalRival && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-3 pt-3 border-t border-white/[0.06]"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-md bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-red-400/70 font-medium mb-0.5">Natural Rival</p>
                        <p className="text-xs text-white/80 italic">
                          &ldquo;{result.naturalRival}&rdquo;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tile 3: CTA Buttons - Compact */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 15 }}
            className="relative group shrink-0"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative p-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl space-y-2">
              {/* Share to X - Primary CTA */}
              <motion.button
                onClick={shareToTwitter}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share on X</span>
              </motion.button>

              {/* Secondary buttons */}
              <div className="flex gap-2">
                <button
                  onClick={downloadCard}
                  className="flex-1 h-9 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/[0.08] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save
                </button>
                <button
                  onClick={copyLink}
                  className="flex-1 h-9 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/[0.08] transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Link
                    </>
                  )}
                </button>
                <button
                  onClick={onStartOver}
                  className={`flex-1 h-9 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isSharePage
                      ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white hover:from-[#5558e3] hover:to-[#7c4fe0]"
                      : "bg-white/[0.05] border border-white/10 text-white/70 hover:bg-white/[0.08]"
                  }`}
                >
                  {isSharePage ? (
                    <>
                      Get Yours
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      New
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Growth Plan - Premium Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative"
      >
        {/* Subtle glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl pointer-events-none" />

        <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
          {/* Gradient accent line */}
          <div className="h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              {/* Custom rocket icon */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.5c0 0-4 4-4 9.5 0 2.5 1 4.5 2 6l2-2 2 2c1-1.5 2-3.5 2-6 0-5.5-4-9.5-4-9.5zm0 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-3 7l1.5-1.5c.5.3 1 .5 1.5.5s1-.2 1.5-.5L15 20.5c-.8.3-1.6.5-2.5.5h-1c-.9 0-1.7-.2-2.5-.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Your Growth Plan</h3>
            </div>
            <p className="text-sm text-white/50 mb-8 ml-11">
              Path to <span className="text-white/70">{DREAM_ROLES[dreamRole].emoji} {DREAM_ROLES[dreamRole].label}</span>
            </p>

            {/* Growth Chips - modern indigo/slate style with hover glow */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-white/40 mb-4">Growth Areas</p>
              <div className="flex flex-wrap gap-2">
                {result.gaps.map((gap, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-sm bg-slate-800/80 text-slate-200 rounded-lg border border-slate-700/50 hover:border-purple-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all duration-200 cursor-default"
                  >
                    {stripMarkdown(gap)}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] mb-8" />

            {/* Roadmap */}
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40 mb-6">4-Phase Roadmap</p>
              <div className="space-y-6">
                {roadmapPhases.map((phase, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-purple-300 text-sm font-bold shrink-0 mt-0.5 border border-purple-500/20">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-white text-[15px] mb-2">{stripMarkdown(phase.title)}</p>
                      <ul className="space-y-1.5">
                        {phase.actions.slice(0, 2).map((action, actionIndex) => (
                          <li key={actionIndex} className="text-sm text-white/60 flex gap-2">
                            <span className="text-purple-400/70 shrink-0">→</span>
                            <span>{stripMarkdown(action)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Required Listening - Premium Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="relative"
      >
        {/* Subtle glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 rounded-2xl blur-2xl pointer-events-none" />

        <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
          {/* Gradient accent line */}
          <div className="h-[2px] bg-gradient-to-r from-red-500 via-pink-500 to-purple-500" />

          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              {/* Custom headphones icon */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Required Listening</h3>
            </div>
            <p className="text-sm text-white/50 mb-8 ml-11">
              Episodes from{" "}
              <a
                href="https://www.youtube.com/@LennysPodcast"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:underline"
              >
                Lenny&apos;s Podcast
              </a>
            </p>

            {/* Episodes - no nested boxes */}
            <div className="space-y-6">
              {result.podcastEpisodes.map((episode, index) => (
                <a
                  key={index}
                  href={getYouTubeSearchUrl(episode.title, episode.guest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 group"
                >
                  {/* YouTube icon */}
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-[15px] group-hover:text-pink-400 transition-colors mb-0.5">
                      {stripMarkdown(episode.title)}
                    </p>
                    <p className="text-sm text-white/50">with {stripMarkdown(episode.guest)}</p>
                    <p className="text-sm text-white/60 mt-1">{stripMarkdown(episode.reason)}</p>
                  </div>
                  <div className="flex items-center text-white/30 group-hover:text-pink-400 transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
