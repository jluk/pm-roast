"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RoastResult, DreamRole, DREAM_ROLES } from "@/lib/types";

interface ResultsProps {
  result: RoastResult;
  dreamRole: DreamRole;
  onStartOver: () => void;
}

export function Results({ result, dreamRole, onStartOver }: ResultsProps) {
  const shareToTwitter = () => {
    const text = `Just got roasted by PM AI. Apparently, I'm "${result.archetype.name}" with a ${result.careerScore}% chance of becoming ${DREAM_ROLES[dreamRole].label}. 💀\n\nI got a 6-month roadmap to fix it. Get your roast here:`;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-6xl mb-4"
        >
          {result.archetype.emoji}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold mb-2"
        >
          You&apos;re a &quot;{result.archetype.name}&quot;
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground"
        >
          {result.archetype.description}
        </motion.p>
      </div>

      {/* Career Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-[#6366f1]/10 to-transparent border-[#6366f1]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Career Score</p>
              <p className="text-4xl font-bold text-[#6366f1]">{result.careerScore}/100</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Dream: {DREAM_ROLES[dreamRole].label}</p>
              <p className="text-sm font-medium text-foreground">{result.dreamRoleReaction}</p>
            </div>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#6366f1]"
              initial={{ width: 0 }}
              animate={{ width: `${result.careerScore}%` }}
              transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
            />
          </div>
        </Card>
      </motion.div>

      {/* The Roast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🔥</span> The Roast
        </h3>
        <Card className="p-6 space-y-4">
          {result.roastBullets.map((bullet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex gap-3"
            >
              <span className="text-[#6366f1] mt-1">•</span>
              <p className="text-muted-foreground">{bullet}</p>
            </motion.div>
          ))}
        </Card>
      </motion.div>

      {/* Gap Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> What&apos;s Missing
        </h3>
        <div className="grid gap-3">
          {result.gaps.map((gap, index) => (
            <Card key={index} className="p-4 border-destructive/20 bg-destructive/5">
              <p className="text-sm">{gap}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* 6-Month Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🗺️</span> Your 6-Month Roadmap to Top 1%
        </h3>
        <div className="space-y-4">
          {result.roadmap.map((month, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#6366f1]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#6366f1] font-bold">M{month.month}</span>
                </div>
                <div>
                  <p className="font-medium mb-2">{month.title}</p>
                  <ul className="space-y-1">
                    {month.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="text-sm text-muted-foreground flex gap-2">
                        <span>→</span> {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Recommended Episodes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🎧</span> Required Listening
        </h3>
        <div className="grid gap-3">
          {result.podcastEpisodes.map((episode, index) => (
            <Card key={index} className="p-4">
              <p className="font-medium">{episode.title}</p>
              <p className="text-sm text-muted-foreground">with {episode.guest}</p>
              <p className="text-sm text-[#6366f1] mt-1">{episode.reason}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Share Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-[#6366f1]/5 to-[#6366f1]/10 border-[#6366f1]/20">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Share Your Roast</h3>
            <p className="text-muted-foreground text-sm">
              &quot;{result.bangerQuote}&quot;
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={shareToTwitter}
              className="bg-black hover:bg-black/80 text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </Button>
            <Button variant="outline" onClick={onStartOver}>
              Start Over
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
