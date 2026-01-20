"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/InteractiveCard";
import { PMElement, PMMove } from "@/components/PokemonCard";
import { getCardRarity, CardRarity } from "@/components/HoloCard";
import { ShareableCard } from "@/lib/share";

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
    description: "Just getting started. Everyone begins somewhere!",
    percentile: "Bottom 40%",
  },
  uncommon: {
    label: "Uncommon",
    emoji: "🔵",
    color: "text-blue-400",
    description: "Solid foundation. Building real PM skills.",
    percentile: "Top 60%",
  },
  rare: {
    label: "Rare",
    emoji: "🟣",
    color: "text-purple-400",
    description: "Above average. Got what it takes to level up.",
    percentile: "Top 40%",
  },
  ultra: {
    label: "Ultra Rare",
    emoji: "💗",
    color: "text-pink-400",
    description: "Impressive. In the upper echelon of PMs.",
    percentile: "Top 25%",
  },
  rainbow: {
    label: "Rainbow Rare",
    emoji: "🌈",
    color: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400",
    description: "Elite tier. Companies fight over PMs like this.",
    percentile: "Top 15%",
  },
  gold: {
    label: "Gold Crown",
    emoji: "👑",
    color: "text-yellow-400",
    description: "Legendary. The PM other PMs aspire to become.",
    percentile: "Top 5%",
  },
};

// Generate YouTube search URL for a podcast episode
function getYouTubeSearchUrl(title: string, guest: string): string {
  const query = `Lenny's Podcast ${guest} ${title}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

interface SharePageClientProps {
  card: ShareableCard;
  dreamRoleLabel: string;
  encodedData: string;
}

export function SharePageClient({ card, dreamRoleLabel, encodedData }: SharePageClientProps) {
  const [archetypeImage, setArchetypeImage] = useState<string | null>(null);
  const rarity = getCardRarity(card.s);
  const rarityInfo = RARITY_INFO[rarity];

  // Try to retrieve the generated image from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedImage = sessionStorage.getItem(`pm-roast-image-${encodedData}`);
        if (storedImage) {
          setArchetypeImage(storedImage);
        }
      } catch (e) {
        // Storage might be disabled, ignore
        console.warn("Could not retrieve image from sessionStorage:", e);
      }
    }
  }, [encodedData]);

  // Reconstruct moves
  const moves: PMMove[] = card.m ? card.m.map(m => ({
    name: m.n,
    energyCost: m.c,
    damage: m.d,
    effect: m.e,
  })) : [];

  // Reconstruct roadmap
  const roadmap = card.rm ? card.rm.map((r, i) => ({
    month: i + 1,
    title: r.t,
    actions: r.a,
  })) : [];

  // Reconstruct podcast episodes
  const podcastEpisodes = card.pe ? card.pe.map(p => ({
    title: p.t,
    guest: p.g,
    reason: p.r,
  })) : [];

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
            PM Roast
          </a>
          <span className="text-xs text-muted-foreground">Powered by Gemini</span>
        </div>
      </nav>

      {/* Main Content */}
      <section className="flex-1 flex flex-col items-center px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-5xl mx-auto space-y-8"
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
                score={card.s}
                archetypeName={card.n}
                archetypeEmoji={card.e}
                archetypeDescription={card.d}
                archetypeImage={archetypeImage || undefined}
                element={(card.el as PMElement) || "chaos"}
                moves={moves}
                stage={card.st || "Senior"}
                weakness={card.w || "Meetings"}
                flavor={card.f || card.d}
                compact
                enableFlip
                enableModal
              />
              <p className="text-xs text-muted-foreground">
                Click card to enlarge & flip
              </p>
            </motion.div>

            {/* Analysis Panel */}
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
                    <span className="font-mono font-bold text-lg">{card.s}/100</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${card.s}%` }}
                      transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                </div>

                {/* Mini Roast Quote */}
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm text-gray-300 italic leading-relaxed">
                    &quot;{card.q}&quot;
                  </p>
                </div>
              </div>

              {/* CTA */}
              <a
                href="/"
                className="block w-full py-4 px-6 text-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold hover:from-[#5558e3] hover:to-[#7c4fe0] transition-all shadow-lg shadow-[#6366f1]/25"
              >
                Get Your Own Roast
              </a>
            </motion.div>
          </div>

          {/* The Roast - Fiery Section */}
          {card.rb && card.rb.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 rounded-3xl blur-xl" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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

                <div className="relative">
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 opacity-60" />
                  <Card className="relative p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 border-0">
                    <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                    <div className="space-y-4">
                      {card.rb.map((bullet, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.15 }}
                          className="flex gap-4 items-start group"
                        >
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                            className="text-2xl shrink-0 mt-0.5"
                          >
                            {index === 0 ? "💀" : index === 1 ? "😬" : index === 2 ? "💅" : "🎯"}
                          </motion.span>
                          <p className="text-base text-gray-200 leading-relaxed group-hover:text-white transition-colors">
                            {bullet}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Gap Analysis */}
          {card.g && card.g.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <span>📊</span> What&apos;s Missing
              </h3>
              <Card className="p-6 border-orange-500/20 bg-orange-500/5">
                <div className="space-y-4">
                  {card.g.map((gap, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-base text-gray-200 pt-0.5">{gap}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Roadmap */}
          {roadmap.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <span>🗺️</span> Your Roadmap to Top 1%
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roadmap.map((phase, index) => (
                  <Card key={index} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#6366f1] font-bold text-sm">P{index + 1}</span>
                      </div>
                      <p className="font-semibold text-white text-sm">{phase.title}</p>
                    </div>
                    <ul className="space-y-2">
                      {phase.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="text-sm text-gray-300 flex gap-2">
                          <span className="text-[#6366f1] shrink-0">→</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommended Episodes */}
          {podcastEpisodes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
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
                {" "}to level up
              </p>
              <div className="grid gap-3">
                {podcastEpisodes.map((episode, index) => (
                  <a
                    key={index}
                    href={getYouTubeSearchUrl(episode.title, episode.guest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="p-4 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all cursor-pointer">
                      <div className="flex gap-4">
                        <div className="w-24 h-16 bg-red-600/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-600/30 transition-colors">
                          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white group-hover:text-[#6366f1] transition-colors">
                            {episode.title}
                          </p>
                          <p className="text-sm text-gray-400">with {episode.guest}</p>
                          <p className="text-sm text-[#6366f1] mt-1">{episode.reason}</p>
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
          )}

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center pt-8"
          >
            <p className="text-gray-400 mb-4">Think you can do better?</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl font-semibold hover:from-[#5558e3] hover:to-[#7c4fe0] transition-all shadow-lg shadow-[#6366f1]/25"
            >
              Get Your Own Roast
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
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
