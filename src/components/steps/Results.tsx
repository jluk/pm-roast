"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RoastResult, DreamRole, DREAM_ROLES, PMElement } from "@/lib/types";
import { generateShareUrl } from "@/lib/share";
import { PokemonCard, PowerStats } from "@/components/PokemonCard";

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto space-y-8 pb-12"
    >
      {/* Pokemon-Style Card + Power Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6"
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
        />
        <div className="w-full max-w-[280px]">
          <PowerStats
            productSense={result.capabilities?.productSense || 75}
            execution={result.capabilities?.execution || 70}
            leadership={result.capabilities?.leadership || 65}
          />
        </div>
      </motion.div>

      {/* Share Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-3"
      >
        <Button
          onClick={shareToTwitter}
          className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e3] hover:to-[#7c4fe0] text-white font-semibold px-6"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </Button>
        <Button
          onClick={copyLink}
          variant="outline"
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
      </motion.div>

      {/* Banger Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center px-4"
      >
        <p className="text-lg text-gray-200 italic">
          &quot;{stripMarkdown(result.bangerQuote)}&quot;
        </p>
      </motion.div>

      {/* The Roast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <span>🔥</span> The Roast
        </h3>
        <Card className="p-6 space-y-4">
          {result.roastBullets.map((bullet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex gap-3"
            >
              <span className="text-[#6366f1] text-lg mt-0.5 shrink-0">•</span>
              <p className="text-base text-gray-200">{stripMarkdown(bullet)}</p>
            </motion.div>
          ))}
        </Card>
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
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <span>🎧</span> Required Listening
        </h3>
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

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex justify-center pt-4"
      >
        <Button variant="outline" onClick={onStartOver} size="lg">
          Start Over
        </Button>
      </motion.div>
    </motion.div>
  );
}
