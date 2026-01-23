"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FamousCard } from "@/lib/famous-cards";
import { CelebrityCard } from "@/lib/celebrity-cards";
import { PokemonCard } from "@/components/PokemonCard";
import { CardBack } from "@/components/CardBack";
import { getCardRarity, CardRarity } from "@/components/HoloCard";

type AnyCard = FamousCard | CelebrityCard;

// Rarity display info
const RARITY_INFO: Record<CardRarity, {
  label: string;
  emoji: string;
  color: string;
  percentile: string;
}> = {
  common: { label: "Common", emoji: "", color: "text-gray-400", percentile: "Bottom 40%" },
  uncommon: { label: "Uncommon", emoji: "", color: "text-blue-400", percentile: "Top 60%" },
  rare: { label: "Rare", emoji: "", color: "text-purple-400", percentile: "Top 40%" },
  ultra: { label: "Ultra Rare", emoji: "", color: "text-pink-400", percentile: "Top 25%" },
  rainbow: { label: "Rainbow Rare", emoji: "", color: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400", percentile: "Top 15%" },
  gold: { label: "Gold Crown", emoji: "", color: "text-yellow-400", percentile: "Top 5%" },
};

interface LegendPageClientProps {
  card: AnyCard;
}

export function LegendPageClient({ card }: LegendPageClientProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rarity = getCardRarity(card.score);
  const rarityInfo = RARITY_INFO[rarity];

  const shareToTwitter = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.pmroast.com";
    const shareUrl = `${baseUrl}/legend/${card.id}`;
    const text = `${card.name} is "${card.archetypeName}" on Mt. Roastmore\n\n"${card.bangerQuote}"\n\nSee more legends get roasted:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleCreateCard = () => {
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
            PM Roast
          </a>
          {/* Center: Navigation Links */}
          <div className="hidden sm:flex items-center gap-1">
            <a
              href="/#roast-me"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
            >
              Roast Me
            </a>
            <a
              href="/#mt-roastmore"
              className="px-3 py-1.5 text-sm text-foreground bg-white/5 border-b-2 border-indigo-500 rounded-lg transition-all"
            >
              Mt. Roastmore
            </a>
            <a
              href="/#archetypes"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
            >
              Archetypes
            </a>
          </div>
          <span className="text-xs text-muted-foreground">Powered by Gemini</span>
        </div>
      </nav>

      {/* Main Content */}
      <section className="flex-1 px-4 pb-12 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section - Card + Bento boxes */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 lg:items-start">
            {/* Left: Flippable Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex flex-col items-center w-full lg:w-[420px] shrink-0 overflow-visible"
            >
              {/* Flippable Card Container */}
              <div
                className="cursor-pointer isolate overflow-visible w-full max-w-[360px] sm:max-w-[400px] mx-auto aspect-[5/7]"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: "1000px" }}
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
                    className="absolute inset-0 transition-opacity duration-150"
                    style={{
                      opacity: isFlipped ? 0 : 1,
                      pointerEvents: isFlipped ? "none" : "auto",
                    }}
                  >
                    <PokemonCard
                      score={card.score}
                      archetypeName={card.archetypeName}
                      archetypeEmoji={card.archetypeEmoji}
                      archetypeDescription={card.archetypeDescription}
                      archetypeImage={card.imageUrl}
                      element={card.element}
                      moves={card.moves}
                      stage={card.stage}
                      weakness={card.weakness}
                      flavor={card.flavor}
                      userName={card.name}
                    />
                  </div>

                  {/* Back of card */}
                  <div
                    className="absolute inset-0 transition-opacity duration-150"
                    style={{
                      opacity: isFlipped ? 1 : 0,
                      pointerEvents: isFlipped ? "auto" : "none",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <CardBack
                      rarity={rarity}
                      roastSummary={{
                        archetypeName: card.archetypeName,
                        score: card.score,
                        bangerQuote: card.bangerQuote,
                        userName: card.name,
                        element: card.element,
                        naturalRival: card.naturalRival,
                      }}
                    />
                  </div>
                </motion.div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click card to flip
              </p>
            </motion.div>

            {/* Right: Bento Glass Tiles */}
            <div className="flex flex-col gap-4 w-full lg:flex-1">
              {/* Tile 1: Legend Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl">
                  {/* Status badge */}
                  <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-widest mb-4">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-yellow-500"
                    />
                    Mt. Roastmore Legend
                  </div>

                  {/* Company & Title */}
                  <div className="pb-4 border-b border-white/5 mb-4">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{card.company}</p>
                    <p className="text-lg text-white/80">{card.title}</p>
                  </div>

                  {/* Rarity & Score Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{rarityInfo.emoji}</span>
                      <div>
                        <div className={`text-base font-bold ${rarityInfo.color}`}>{rarityInfo.label}</div>
                        <div className="text-xs text-white/40">{rarityInfo.percentile}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-3xl text-white">{card.score}</span>
                      <span className="text-lg text-white/40">/100</span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mt-4 h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${card.score}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Tile 2: Banger Quote */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-orange-500/20 shadow-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                    </svg>
                    <p className="text-[15px] text-white/90 font-medium leading-relaxed italic">
                      &ldquo;{card.bangerQuote}&rdquo;
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Tile 3: CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 15 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl space-y-3">
                  {/* Share to X - Primary CTA */}
                  <div className="relative group/share">
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

                    {/* Tweet preview tooltip - desktop only */}
                    <div className="hidden md:block absolute top-full left-0 right-0 mt-3 opacity-0 group-hover/share:opacity-100 transition-all duration-200 pointer-events-none -translate-y-2 group-hover/share:translate-y-0 z-10">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-black/95 border-l border-t border-white/20 transform rotate-45" />
                      <div className="p-4 rounded-xl bg-black/95 border border-white/20 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <svg className="w-5 h-5 text-white/60 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          <p className="text-sm text-white/90 leading-relaxed">
                            {card.name} is &quot;{card.archetypeName}&quot; on Mt. Roastmore<br /><br />&quot;{card.bangerQuote}&quot;
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50 border-t border-white/10 pt-3">
                          <span className="px-2 py-0.5 rounded bg-white/10">Preview</span>
                          <span>Click button to post</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Create Your Own Card CTA */}
                  <motion.button
                    onClick={handleCreateCard}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.5 1.5-4.5 3-6.5s3-4.5 3-7.5c0 0 1 2 2 4 .5-1 1-2 1-3 2.5 3.5 5 6.5 5 13 0 3.866-3.134 7-7 7z"/>
                    </svg>
                    Get Your Own Roast
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* The Roast Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative mt-12"
          >
            {/* Ember glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/15 via-red-600/10 to-orange-600/15 rounded-2xl blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl bg-black/40 backdrop-blur-xl border border-orange-500/20 overflow-hidden">
              {/* Singed gradient accent line */}
              <div className="h-[2px] bg-gradient-to-r from-orange-600 via-red-500 to-orange-600" />

              <div className="px-8 py-8">
                {/* Header with flame icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/30 to-red-600/30 flex items-center justify-center border border-orange-500/30">
                    <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.5 1.5-4.5 3-6.5s3-4.5 3-7.5c0 0 1 2 2 4 .5-1 1-2 1-3 2.5 3.5 5 6.5 5 13 0 3.866-3.134 7-7 7zm0-2c2.761 0 5-2.239 5-5 0-2.5-1.5-5-3-7-.5 1-1 2-2 3-.5-1-1-2-1.5-3-1 1.5-2.5 3.5-2.5 7 0 2.761 2.239 5 5 5z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">The Roast</h3>
                  <span className="text-xs text-orange-400/60 uppercase tracking-wider ml-auto">Brutal Truths</span>
                </div>

                {/* Banger Quote - prominently displayed under header */}
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10">
                  <svg className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                  </svg>
                  <p className="text-lg text-white/90 font-medium leading-relaxed">
                    {card.bangerQuote}
                  </p>
                </div>

                {/* Roast bullets with Heat Meter */}
                <div className="space-y-5">
                  {card.roastBullets.map((bullet, index) => {
                    const heatLevel = index === 0 ? 3 : index === 1 ? 2 : 1;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex gap-4 items-start p-3 rounded-lg hover:bg-white/[0.02] transition-all duration-300"
                      >
                        {/* Heat Meter - 3 flame bars */}
                        <div className="flex flex-col gap-0.5 shrink-0 mt-1">
                          {[3, 2, 1].map((level) => (
                            <div
                              key={level}
                              className={`w-3 h-1.5 rounded-sm transition-all ${
                                level <= heatLevel
                                  ? level === 3
                                    ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                                    : level === 2
                                      ? "bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.5)]"
                                      : "bg-amber-500"
                                  : "bg-zinc-700/50"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Roast text */}
                        <p className="text-[15px] text-zinc-300/90 leading-relaxed">
                          {bullet}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Natural Rival */}
                {card.naturalRival && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="mt-8 pt-6 border-t border-white/[0.06]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-md bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-red-400/70 font-medium mb-1">Natural Rival</p>
                        <p className="text-[15px] text-white/80 italic">
                          &ldquo;{card.naturalRival}&rdquo;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Signature Moves Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative mt-8"
          >
            {/* Subtle glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
              {/* Gradient accent line */}
              <div className="h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

              <div className="px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Signature Moves</h3>
                </div>

                {/* Moves grid */}
                <div className="grid gap-4">
                  {card.moves.map((move, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Energy cost indicator */}
                        <div className="flex gap-1">
                          {Array.from({ length: move.energyCost }).map((_, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]"
                            />
                          ))}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{move.name}</p>
                          <p className="text-sm text-white/50">{move.effect}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">{move.damage}</span>
                        <span className="text-sm text-white/40 ml-1">DMG</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Built by{" "}
            <a
              href="https://jluk.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent transition-colors"
            >
              Justin Luk
            </a>
          </span>
          <a
            href="https://github.com/jluk/pm-roast"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Source
          </a>
        </div>
      </footer>
    </main>
  );
}
