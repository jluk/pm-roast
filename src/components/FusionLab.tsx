"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAMOUS_CARDS } from "@/lib/famous-cards";
import { CELEBRITY_CARDS } from "@/lib/celebrity-cards";
import { PMElement, RoastResult } from "@/lib/types";
import type { FusionParent } from "@/lib/fusion";
import { PokemonCard } from "@/components/PokemonCard";
import { HoloCard } from "@/components/HoloCard";
import { SectionHeader } from "@/components/SectionHeader";

interface Slot {
  id: string;
  name: string;
  imageUrl: string;
  score: number;
  element: PMElement;
  archetypeEmoji: string;
  isUser?: boolean;
  parent?: FusionParent; // inline parent data (user card)
  image?: string; // data URL reference (user card)
}

const POOL: Slot[] = [...FAMOUS_CARDS, ...CELEBRITY_CARDS].map((c) => ({
  id: c.id,
  name: c.name,
  imageUrl: c.imageUrl,
  score: c.score,
  element: c.element,
  archetypeEmoji: c.archetypeEmoji,
}));

// Client mirror of the backend pipeline — advanced by streamed stage events.
const STEPS = [
  { key: "analyze", label: "Reading both cards", detail: "Element fusion matrix" },
  { key: "text", label: "Writing the hybrid archetype", detail: "gemini-2.5-flash · JSON mode" },
  { key: "image", label: "Fusing the two likenesses", detail: "gemini-3 image · 2 photos → 1 character" },
  { key: "store", label: "Minting the fusion card", detail: "Permanent, shareable card" },
] as const;

const SESSION_KEY = "fusionSeed";

function SlotView({ card, label, onClear }: { card: Slot | null; label: string; onClear: () => void }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
        {card?.isUser && <span className="ml-2 text-indigo-300/80">YOUR CARD</span>}
      </div>
      {card ? (
        <button
          onClick={onClear}
          className={`group relative w-full aspect-[16/10] rounded-xl overflow-hidden border bg-black/40 ${
            card.isUser ? "border-indigo-400/60" : "border-white/15"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image || card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white truncate">{card.name}</span>
            <span className="text-xs font-bold text-white/80">{card.score}</span>
          </div>
          <div className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium text-white/90">✕ remove</span>
          </div>
        </button>
      ) : (
        <div className="w-full aspect-[16/10] rounded-xl border border-dashed border-white/15 grid place-items-center text-white/30 text-sm">
          Pick a card
        </div>
      )}
    </div>
  );
}

// Live pipeline stepper shown during Polymerize.
function Stepper({ active }: { active: string | null }) {
  const activeIdx = STEPS.findIndex((s) => s.key === active);
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-300/70">Pipeline</div>
      {STEPS.map((s, i) => {
        const done = activeIdx > i || active === "done";
        const isActive = active === s.key;
        return (
          <div key={s.key} className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 shrink-0 grid place-items-center">
              {done ? (
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : isActive ? (
                <svg className="w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/20" />
              )}
            </div>
            <div className="min-w-0">
              <div className={`text-sm ${done ? "text-white/50" : isActive ? "text-white font-medium" : "text-white/40"}`}>
                {s.label}
              </div>
              <div className="text-[11px] font-mono text-white/30">{s.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FusionLab() {
  const [a, setA] = useState<Slot | null>(null);
  const [b, setB] = useState<Slot | null>(null);
  const [query, setQuery] = useState("");
  const [isFusing, setIsFusing] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ card: RoastResult; cardId: string | null } | null>(null);

  // Pick up a "fuse with a legend" seed handed off from a user's result card.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      sessionStorage.removeItem(SESSION_KEY);
      const seed = JSON.parse(raw) as { parent: FusionParent; image: string };
      if (!seed?.parent) return;
      setA({
        id: "you",
        name: seed.parent.name || "Your Card",
        imageUrl: seed.image || "",
        image: seed.image,
        score: seed.parent.score,
        element: seed.parent.element,
        archetypeEmoji: seed.parent.archetypeEmoji,
        isUser: true,
        parent: seed.parent,
      });
      // Bring the lab into view
      requestAnimationFrame(() => document.getElementById("fusion")?.scrollIntoView({ behavior: "smooth" }));
    } catch {
      /* ignore */
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? POOL.filter((c) => c.name.toLowerCase().includes(q)) : POOL;
    return list.slice(0, 60);
  }, [query]);

  const pick = (card: Slot) => {
    setError(null);
    if (a?.id === card.id && !a?.isUser) return setA(null);
    if (b?.id === card.id) return setB(null);
    if (!a) return setA(card);
    if (!b) return setB(card);
    setA(b);
    setB(card);
  };

  const specFor = (s: Slot) =>
    s.isUser ? { card: s.parent, image: s.image } : { id: s.id };

  const polymerize = async () => {
    if (!a || !b || isFusing) return;
    setIsFusing(true);
    setError(null);
    setActiveStep(null);
    try {
      const aSpec = specFor(a);
      const bSpec = specFor(b);
      const res = await fetch("/api/fuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aId: aSpec.id, aCard: aSpec.card, aImage: aSpec.image,
          bId: bSpec.id, bCard: bSpec.card, bImage: bSpec.image,
        }),
      });
      if (!res.body) {
        setError("The fusion fizzled. Try again.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let got = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const evt = JSON.parse(line);
          if (evt.t === "stage") setActiveStep(evt.key);
          else if (evt.t === "done") {
            got = true;
            setActiveStep("done");
            setResult({ card: evt.card, cardId: evt.cardId || null });
          } else if (evt.t === "error") {
            setError(evt.error || "The fusion fizzled. Try again.");
          }
        }
      }
      if (!got && !error) setError("The fusion fizzled. Try again.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsFusing(false);
      setActiveStep(null);
    }
  };

  const reset = () => {
    setResult(null);
    setA(null);
    setB(null);
    setQuery("");
    setError(null);
  };

  return (
    <section id="fusion" className="w-full max-w-5xl mx-auto mt-12 md:mt-20 px-4 scroll-mt-20">
      <SectionHeader
        eyebrow="Polymerization"
        title="Fusion Lab"
        subtitle="Merge two legends into one hybrid card — a new archetype, a fused likeness, one-of-one."
      />

      <div className="mt-10">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="reveal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-300/70">
                {a?.name} <span className="text-white/30">×</span> {b?.name}
              </div>
              <HoloCard rarity={result.card.careerScore >= 90 ? "rainbow" : "ultra"} score={result.card.careerScore}>
                <PokemonCard
                  score={result.card.careerScore}
                  archetypeName={result.card.archetype.name}
                  archetypeEmoji={result.card.archetype.emoji}
                  archetypeDescription={result.card.archetype.description}
                  archetypeImage={result.card.archetypeImage}
                  element={result.card.archetype.element}
                  moves={result.card.moves}
                  stage={result.card.archetype.stage}
                  weakness={result.card.archetype.weakness}
                  productSense={result.card.capabilities.productSense}
                  execution={result.card.capabilities.execution}
                  leadership={result.card.capabilities.leadership}
                  userName={result.card.userName}
                  fusion={result.card.fusion}
                />
              </HoloCard>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {result.cardId && (
                  <a href={`/card/${result.cardId}`} className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-semibold flex items-center gap-2 hover:from-[#5558e3] hover:to-[#7c4fe0] transition-colors">
                    View &amp; share full card →
                  </a>
                )}
                <button onClick={reset} className="h-11 px-6 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 text-sm font-medium hover:bg-white/[0.08] transition-colors">
                  ⚗️ Fuse another
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-end gap-3 sm:gap-4 mb-6">
                <SlotView card={a} label="Card A" onClear={() => setA(null)} />
                <div className="pb-4 text-2xl text-indigo-300/70 select-none">⚗️</div>
                <SlotView card={b} label="Card B" onClear={() => setB(null)} />
              </div>

              <button
                onClick={polymerize}
                disabled={!a || !b || isFusing}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
              >
                {isFusing ? "Polymerizing…" : <>⚗️ Polymerize{a && b ? ` — ${a.name} × ${b.name}` : ""}</>}
              </button>

              {isFusing && <Stepper active={activeStep} />}
              {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}

              {!isFusing && (
                <div className="mt-8">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search legends to fuse…"
                    className="w-full h-11 px-4 mb-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition-all"
                  />
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {filtered.map((card) => {
                      const selected = (a?.id === card.id && !a?.isUser) || b?.id === card.id;
                      return (
                        <button
                          key={card.id}
                          onClick={() => pick(card)}
                          className={`group relative aspect-[3/4] rounded-lg overflow-hidden border transition-all ${
                            selected ? "border-indigo-400 ring-2 ring-indigo-400/50" : "border-white/10 hover:border-white/25"
                          }`}
                          title={card.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                          <span className="absolute bottom-1.5 left-2 right-2 text-[11px] font-medium text-white leading-tight line-clamp-2 text-left">
                            {card.name}
                          </span>
                          {selected && (
                            <span className="absolute top-1.5 right-1.5 grid place-items-center w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px]">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
