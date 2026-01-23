"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAMOUS_CARDS, FamousCard } from "@/lib/famous-cards";
import { CELEBRITY_CARDS, CelebrityCard } from "@/lib/celebrity-cards";

// Union type for both card types (they share the same structure)
type AnyCard = FamousCard | CelebrityCard;
import { PokemonCard } from "./PokemonCard";
import { CardBack } from "./CardBack";
import { getCardRarity, CardRarity } from "./HoloCard";

// Rarity display info (matching Results.tsx)
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

// Seeded random for consistent SSR/client rendering
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Shuffle array using Fisher-Yates with a seed for deterministic results
function shuffleArray<T>(array: T[], seed: number = 42): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Flippable card for the grid - shows front, flips to back on hover (desktop) or tap (mobile)
function GridCard({
  card,
  onClick,
}: {
  card: AnyCard;
  onClick: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rarity = getCardRarity(card.score);
  const rarityInfo = RARITY_INFO[rarity];

  // Determine mobile after mount to avoid hydration mismatch
  const isMobile = mounted && typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (!mounted || !isMobile) {
      // Desktop or not yet mounted - open modal directly
      onClick();
    } else {
      // Mobile - tap to flip, second tap opens modal
      if (isFlipped) {
        onClick();
      } else {
        setIsFlipped(true);
      }
    }
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => mounted && !isMobile && setIsFlipped(true)}
      onMouseLeave={() => mounted && !isMobile && setIsFlipped(false)}
      onClick={handleClick}
    >
      {/* Container with fixed dimensions matching the 300px x 420px card (aspect 5:7) */}
      <div
        className="relative w-[300px] h-[420px] mx-auto"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
        >
          {/* Front - The Card */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
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
              compact
              userName={card.name}
            />
            {/* Mobile tap hint - only show after mount on mobile */}
            {mounted && isMobile && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                <span className="text-white/70 text-xs">Tap to flip</span>
              </div>
            )}
          </div>

          {/* Back - Roast Preview */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-4 border-orange-500/50 rounded-xl p-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/50"
              />
              <div>
                <h3 className="text-white font-bold text-sm">{card.name}</h3>
                <p className="text-orange-400 text-xs">{card.archetypeName}</p>
              </div>
              <div className="ml-auto text-right">
                <span className="text-2xl">{rarityInfo.emoji}</span>
                <p className="text-white/50 text-xs">{card.score}/100</p>
              </div>
            </div>

            {/* Banger Quote */}
            <div className="flex-1 flex items-center justify-center px-2">
              <p className="text-white/90 text-sm italic text-center leading-relaxed">
                &quot;{card.bangerQuote}&quot;
              </p>
            </div>

            {/* Roast Preview - blurred/masked */}
            <div className="mt-4 relative">
              <div className="space-y-1">
                {card.roastBullets.slice(0, 2).map((bullet, i) => (
                  <p key={i} className="text-white/40 text-xs line-clamp-1 blur-[2px]">
                    {bullet}
                  </p>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
            </div>

            {/* CTA Button */}
            <button className="mt-3 w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.5 1.5-4.5 3-6.5s3-4.5 3-7.5c0 0 1 2 2 4 .5-1 1-2 1-3 2.5 3.5 5 6.5 5 13 0 3.866-3.134 7-7 7z"/>
              </svg>
              Read the Full Roast
            </button>
          </div>
        </div>
        </motion.div>
      </div>
    </div>
  );
}

// Expanded view matching Results.tsx style - Safe Scroll layout
function ExpandedCardView({
  card,
  onClose,
}: {
  card: AnyCard;
  onClose: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rarity = getCardRarity(card.score);
  const rarityInfo = RARITY_INFO[rarity];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleCreateCard = () => {
    onClose();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shareToTwitter = () => {
    const text = `${card.name} is "${card.archetypeName}" on Mt. Roastmore\n\n"${card.bangerQuote}"\n\nSee more legends get roasted:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent("https://www.pmroast.com")}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto isolate"
      onClick={onClose}
    >
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Scrollable content area - clicks here close unless on content */}
      <div className="min-h-screen px-4 pb-12 pt-16 lg:pt-10">
        {/* Main content wrapper - stops propagation */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section - Card + Bento boxes */}
          <div>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 lg:items-start">
            {/* Left: Flippable Card - Fixed width on desktop with overflow visible for hover effects */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex flex-col items-center w-full lg:w-[420px] shrink-0 overflow-visible"
            >
              {/* Flippable Card Container - overflow-visible prevents hover clipping */}
              <div
                className="cursor-pointer isolate overflow-visible w-full max-w-[360px] sm:max-w-[400px] mx-auto aspect-[5/7]"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  perspective: "1000px",
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
                  {/* Front of card - use opacity for visibility since backfaceVisibility breaks with HoloCard's nested 3D context */}
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

                  {/* Back of card - use opacity for visibility since backfaceVisibility breaks with HoloCard's nested 3D context */}
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

            {/* Right: Bento Glass Tiles - justify-between for flush alignment with card */}
            <div className="flex flex-col gap-4 w-full lg:flex-1 lg:h-auto xl:h-[560px] lg:justify-between">
              {/* Tile 1: Legend Info (company, title, rarity, score) */}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl">
                  <div className="flex items-start gap-4">
                    <svg className="w-5 h-5 text-orange-400 shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                    </svg>
                    <p className="text-[17px] text-white/90 font-medium leading-relaxed">
                      {card.bangerQuote}
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

              {/* Scroll indicator - visible on desktop when content is below fold */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="hidden lg:flex items-center justify-center gap-2 text-white/40 text-sm pt-2"
              >
                <span>Scroll for the roast</span>
                <motion.svg
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </motion.svg>
              </motion.div>
            </div>
          </div>
        </div>

        {/* The Roast - Normal document flow below hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative max-w-6xl mx-auto mt-12"
        >
          {/* Ember glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/15 via-red-600/10 to-orange-600/15 rounded-2xl blur-2xl pointer-events-none" />

          <div className="relative rounded-2xl bg-black/40 backdrop-blur-xl border border-orange-500/20 overflow-hidden">
            {/* Singed gradient accent line */}
            <div className="h-[2px] bg-gradient-to-r from-orange-600 via-red-500 to-orange-600" />

            <div className="px-8 py-8">
              {/* Header with flame icon */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/30 to-red-600/30 flex items-center justify-center border border-orange-500/30">
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.5 1.5-4.5 3-6.5s3-4.5 3-7.5c0 0 1 2 2 4 .5-1 1-2 1-3 2.5 3.5 5 6.5 5 13 0 3.866-3.134 7-7 7zm0-2c2.761 0 5-2.239 5-5 0-2.5-1.5-5-3-7-.5 1-1 2-2 3-.5-1-1-2-1.5-3-1 1.5-2.5 3.5-2.5 7 0 2.761 2.239 5 5 5z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">The Roast</h3>
                <span className="text-xs text-orange-400/60 uppercase tracking-wider ml-auto">Brutal Truths</span>
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

        {/* Signature Moves - Normal document flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative max-w-6xl mx-auto mt-8"
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
                      {/* Energy cost indicators */}
                      <div className="flex gap-1">
                        {Array.from({ length: move.energyCost }).map((_, i) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500/60 to-indigo-500/60 flex items-center justify-center text-[9px] font-bold text-white border border-purple-400/30">
                            {card.element.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-white font-medium">{move.name}</p>
                        {move.effect && <p className="text-white/50 text-sm mt-0.5">{move.effect}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold text-xl">{move.damage}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </motion.div>
  );
}

type PackColor = "red" | "blue";

// Single Holographic Booster Pack
function HolographicPack({
  color,
  onSelect,
  isHovered,
  onHover,
}: {
  color: PackColor;
  onSelect: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) {
  const isRed = color === "red";

  const gradients = isRed
    ? {
        main: "from-red-600 via-red-500 to-orange-500",
        accent: "from-red-400 to-orange-400",
        glow: "rgba(239, 68, 68, 0.5)",
        border: "#dc2626",
        highlight: "#fca5a5",
      }
    : {
        main: "from-blue-600 via-blue-500 to-cyan-500",
        accent: "from-blue-400 to-cyan-400",
        glow: "rgba(59, 130, 246, 0.5)",
        border: "#2563eb",
        highlight: "#93c5fd",
      };

  return (
    <motion.div
      className="relative cursor-pointer"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onSelect}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.98 }}
      animate={isHovered ? { y: -5 } : { y: 0 }}
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute -inset-4 rounded-3xl blur-2xl bg-gradient-to-b ${gradients.main}`}
        animate={{
          opacity: isHovered ? 0.6 : 0.3,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Pack container - sized to match gallery cards */}
      <div
        className="relative w-[140px] sm:w-[200px] md:w-[220px] aspect-[5/7] rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${gradients.border}, #1a1a2e)`,
          boxShadow: isHovered
            ? `0 20px 60px ${gradients.glow}, 0 0 40px ${gradients.glow}`
            : `0 10px 30px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Inner pack */}
        <div
          className={`absolute inset-1 rounded-xl bg-gradient-to-br ${gradients.main} overflow-hidden`}
        >
          {/* Holographic overlay - animated */}
          <motion.div
            className="absolute inset-0 opacity-60"
            style={{
              background: `linear-gradient(
                135deg,
                transparent 0%,
                rgba(255,255,255,0.1) 25%,
                rgba(255,255,255,0.3) 50%,
                rgba(255,255,255,0.1) 75%,
                transparent 100%
              )`,
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Rainbow holographic shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                45deg,
                rgba(255,0,0,0.1) 0%,
                rgba(255,127,0,0.1) 14%,
                rgba(255,255,0,0.1) 28%,
                rgba(0,255,0,0.1) 42%,
                rgba(0,0,255,0.1) 57%,
                rgba(75,0,130,0.1) 71%,
                rgba(148,0,211,0.1) 85%,
                rgba(255,0,0,0.1) 100%
              )`,
              backgroundSize: "400% 400%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Diagonal shine sweep */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
            }}
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
          />

          {/* Pack design elements */}
          <div className="absolute inset-0 flex flex-col items-center justify-between py-4 sm:py-6 px-3 sm:px-4">
            {/* Top seal line */}
            <div className="w-full">
              <div
                className="h-2 sm:h-3 md:h-4 rounded-full mx-2"
                style={{
                  background: `linear-gradient(90deg, transparent, ${gradients.highlight}, transparent)`,
                  boxShadow: `0 0 10px ${gradients.highlight}`,
                }}
              />
              <div className="flex justify-center mt-1">
                <div className="w-8 sm:w-10 h-1 rounded-full bg-white/30" />
              </div>
            </div>

            {/* Center logo area */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* PM ROAST text */}
              <div className="text-center mb-3">
                <div
                  className="text-[10px] sm:text-xs md:text-sm font-black tracking-[0.3em] text-white/90"
                  style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                >
                  PM ROAST
                </div>
              </div>

              {/* Card icon */}
              <motion.div
                className="w-14 h-20 sm:w-20 sm:h-28 md:w-24 md:h-32 rounded-lg bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center relative overflow-hidden"
                animate={isHovered ? { rotateY: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {/* Mini holographic effect on card */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-2xl sm:text-3xl md:text-4xl relative z-10">{isRed ? "🎬" : "💻"}</span>
              </motion.div>

              {/* Booster Pack label */}
              <div
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[11px] md:text-xs font-bold uppercase tracking-wider"
                style={{
                  background: `linear-gradient(135deg, ${gradients.highlight}40, ${gradients.border}60)`,
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                Booster Pack
              </div>
            </div>

            {/* Bottom seal */}
            <div className="w-full">
              <div className="flex justify-center mb-1">
                <div className="w-8 sm:w-10 h-1 rounded-full bg-white/30" />
              </div>
              <div
                className="h-2 sm:h-2.5 rounded-full mx-4"
                style={{
                  background: `linear-gradient(90deg, transparent, ${gradients.highlight}80, transparent)`,
                }}
              />
            </div>
          </div>

          {/* Corner triangles for sealed look */}
          <div
            className="absolute top-0 right-0 w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12"
            style={{
              background: `linear-gradient(135deg, transparent 50%, ${gradients.highlight}40 50%)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12"
            style={{
              background: `linear-gradient(-45deg, transparent 50%, ${gradients.highlight}40 50%)`,
            }}
          />
        </div>
      </div>

      {/* Pack label */}
      <motion.div
        className="mt-4 sm:mt-5 text-center"
        animate={{ opacity: isHovered ? 1 : 0.7 }}
      >
        <p className={`text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r ${gradients.accent} bg-clip-text text-transparent`}>
          {isRed ? "Chaos" : "SV"}
        </p>
        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
          {isRed ? "Celebrities & Icons" : "Tech Founders & VCs"}
        </p>
      </motion.div>
    </motion.div>
  );
}

// Two-Pack Selection Component
function PackSelection({ onSelectPack, isOpening }: { onSelectPack: (color: PackColor) => void; isOpening: boolean }) {
  const [hoveredPack, setHoveredPack] = useState<PackColor | null>(null);

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto text-center py-4 sm:py-8"
      animate={isOpening ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          🎁 Free Booster Pack
        </h3>
        <p className="text-muted-foreground text-sm">
          Choose a pack to reveal more legends
        </p>
      </motion.div>

      {/* Packs */}
      <div className="flex justify-center gap-6 sm:gap-8 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HolographicPack
            color="red"
            onSelect={() => onSelectPack("red")}
            isHovered={hoveredPack === "red"}
            onHover={(h) => setHoveredPack(h ? "red" : null)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <HolographicPack
            color="blue"
            onSelect={() => onSelectPack("blue")}
            isHovered={hoveredPack === "blue"}
            onHover={(h) => setHoveredPack(h ? "blue" : null)}
          />
        </motion.div>
      </div>

      {/* Hint text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-muted-foreground mt-6 sm:mt-8"
      >
        Click a pack to open it
      </motion.p>

      <p className="text-white/40 text-xs mt-2">
        Contains {FAMOUS_CARDS.length > 8 ? 4 : Math.min(4, FAMOUS_CARDS.length - 4)} more legends
      </p>
    </motion.div>
  );
}

// Card reveal animation wrapper
function RevealedCard({
  card,
  index,
  onClick
}: {
  card: AnyCard;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.3,
        rotateY: 180,
        y: -100,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateY: 0,
        y: 0,
      }}
      transition={{
        delay: 0.3 + index * 0.15,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 12,
      }}
      className="w-[300px] mx-auto relative"
    >
      {/* Reveal sparkle effect */}
      <motion.div
        className="absolute -inset-4 z-10 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{
              left: "50%",
              top: "50%",
              scale: 0,
            }}
            animate={{
              left: `${50 + Math.cos(i * Math.PI / 4) * 60}%`,
              top: `${50 + Math.sin(i * Math.PI / 4) * 60}%`,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              delay: 0.3 + index * 0.15,
              duration: 0.6,
            }}
          />
        ))}
      </motion.div>

      <GridCard card={card} onClick={onClick} />
    </motion.div>
  );
}

export function FamousCardsGallery() {
  const [selectedCard, setSelectedCard] = useState<AnyCard | null>(null);
  const [packOpened, setPackOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [randomSeed, setRandomSeed] = useState<number | null>(null);
  const [selectedPackColor, setSelectedPackColor] = useState<PackColor | null>(null);

  // Generate random seed on mount (client-side only)
  useEffect(() => {
    setRandomSeed(Math.random() * 100000);
  }, []);

  // Memoize the shuffled cards - first row is a mix, second row depends on pack selection
  const { firstRowCards, secondRowCards } = useMemo(() => {
    const seed = randomSeed ?? 42;

    // Mix both card sets for the first row (2 tech + 2 celebrity)
    const shuffledTech = shuffleArray(FAMOUS_CARDS, seed);
    const shuffledCeleb = shuffleArray(CELEBRITY_CARDS, seed + 1);

    // First row: alternating tech and celebrity for variety
    const firstRowCards: AnyCard[] = [
      shuffledTech[0],
      shuffledCeleb[0],
      shuffledTech[1],
      shuffledCeleb[1],
    ];

    // Second row depends on pack selection
    // Chaos (red) = celebrities, SV (blue) = tech famous cards
    let secondRowCards: AnyCard[];
    if (selectedPackColor === "red") {
      // Chaos pack - show celebrities (skip first 2 already used)
      secondRowCards = shuffledCeleb.slice(2, 6);
    } else {
      // SV pack (blue) or not yet selected - show tech cards (skip first 2 already used)
      secondRowCards = shuffledTech.slice(2, 6);
    }

    return { firstRowCards, secondRowCards };
  }, [randomSeed, selectedPackColor]);

  const handleOpenPack = (color: PackColor) => {
    setSelectedPackColor(color);
    setIsOpening(true);
    // Delay the reveal for the pack animation
    setTimeout(() => {
      setPackOpened(true);
      setIsOpening(false);
    }, 600);
  };

  return (
    <div className={`pt-8 md:pt-12 ${packOpened ? "pb-8 md:pb-12" : "pb-0"}`}>
      {/* Section Header */}
      <div id="mt-roastmore" className="text-center mb-8 md:mb-10 px-4 scroll-mt-16">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          Mt. Roastmore
        </h2>
        <p className="text-white/50 text-sm max-w-md mx-auto">
          The best and worst PMs, immortalized in roast.
        </p>
        <p className="text-white/40 text-xs mt-1">
          <span className="hidden md:inline">Hover to peek the burn.</span><span className="md:hidden">Tap to flip.</span>
        </p>
      </div>

      {/* First Row - Always visible */}
      <div className="px-4 md:px-8 md:max-w-7xl md:mx-auto overflow-visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-6 overflow-visible">
          {firstRowCards.map((card) => (
            <div
              key={card.id}
              className="w-full max-w-[300px] mx-auto sm:max-w-none overflow-visible"
            >
              <GridCard
                card={card}
                onClick={() => setSelectedCard(card)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Booster Pack or Second Row */}
      <div className="mt-8 md:mt-10 px-4 md:px-8 md:max-w-7xl md:mx-auto">
        <AnimatePresence mode="wait">
          {!packOpened ? (
            <motion.div
              key="pack"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center"
            >
              <PackSelection onSelectPack={handleOpenPack} isOpening={isOpening} />
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {/* Pokemon-style Legendary Pull celebration */}
              <motion.div
                className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 2.5, duration: 0.5 }}
              >
                {/* Radial burst background */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{ duration: 1.5 }}
                >
                  <div className="w-[600px] h-[600px] bg-gradient-radial from-yellow-500/30 via-orange-500/10 to-transparent rounded-full" />
                </motion.div>

                {/* Starburst rays */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-40 bg-gradient-to-t from-yellow-400/60 to-transparent origin-bottom"
                      style={{ rotate: `${i * 30}deg` }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: [0, 1, 0] }}
                      transition={{ delay: 0.1, duration: 1.2, ease: "easeOut" }}
                    />
                  ))}
                </div>

                {/* Confetti particles - using deterministic values based on index */}
                {[...Array(40)].map((_, i) => {
                  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
                  const color = colors[i % colors.length];
                  // Deterministic values based on index
                  const angle = (i / 40) * Math.PI * 2;
                  const distance = 150 + (i % 5) * 50;
                  const xPos = Math.cos(angle) * distance;
                  const yPos = -200 - (i % 4) * 50;
                  const rotation = (i % 2 === 0 ? 1 : -1) * (180 + i * 18);
                  const delay = (i % 8) * 0.04;
                  const size = 6 + (i % 4) * 2;
                  const isCircle = i % 2 === 0;

                  return (
                    <motion.div
                      key={i}
                      className={isCircle ? "rounded-full" : "rounded-sm"}
                      style={{
                        position: 'absolute',
                        width: size,
                        height: isCircle ? size : size * 2,
                        backgroundColor: color,
                      }}
                      initial={{
                        x: 0,
                        y: 0,
                        scale: 0,
                        rotate: 0,
                        opacity: 1
                      }}
                      animate={{
                        x: xPos,
                        y: yPos + 400,
                        scale: 1,
                        rotate: rotation,
                        opacity: 0
                      }}
                      transition={{
                        delay: delay,
                        duration: 2,
                        ease: "easeOut"
                      }}
                    />
                  );
                })}

                {/* Main text badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 15 }}
                  className="relative"
                >
                  {/* Outer glow */}
                  <div className="absolute inset-0 blur-xl bg-yellow-400/50 rounded-2xl scale-150" />

                  {/* Badge container */}
                  <div className="relative px-6 py-3 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-xl border-4 border-yellow-300 shadow-2xl">
                    {/* Inner border */}
                    <div className="absolute inset-1 border-2 border-yellow-200/50 rounded-lg" />

                    {/* Stars decoration */}
                    <motion.span
                      className="absolute -left-3 -top-3 text-2xl"
                      animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 3, ease: "easeInOut" }}
                    >
                      ⭐
                    </motion.span>
                    <motion.span
                      className="absolute -right-3 -top-3 text-2xl"
                      animate={{ rotate: [0, -20, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 3, delay: 0.1, ease: "easeInOut" }}
                    >
                      ⭐
                    </motion.span>
                    <motion.span
                      className="absolute -left-2 -bottom-2 text-xl"
                      animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: 3, delay: 0.2, ease: "easeInOut" }}
                    >
                      ✨
                    </motion.span>
                    <motion.span
                      className="absolute -right-2 -bottom-2 text-xl"
                      animate={{ rotate: [0, -15, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: 3, delay: 0.15, ease: "easeInOut" }}
                    >
                      ✨
                    </motion.span>

                    {/* Text with Pokemon-style stroke effect */}
                    <div className="relative">
                      <span
                        className="text-2xl md:text-3xl font-black text-white tracking-tight"
                        style={{
                          textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.4)'
                        }}
                      >
                        {selectedPackColor === "red" ? "BOLD PULL!" : "NERDY PULL!"}
                      </span>
                    </div>
                  </div>

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-xl"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                </motion.div>
              </motion.div>

              {/* Second Row Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-8 overflow-visible">
                {secondRowCards.map((card, index) => (
                  <RevealedCard
                    key={card.id}
                    card={card}
                    index={index}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {selectedCard && (
          <ExpandedCardView
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
