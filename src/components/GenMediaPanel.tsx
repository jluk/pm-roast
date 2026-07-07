"use client";

import { motion } from "framer-motion";
import { RoastResult } from "@/lib/types";

// Models actually used by the API routes. Keep in sync with
// src/lib/image-generation.ts (IMAGE_MODEL) and the roast routes' text model.
const TEXT_MODEL = "Gemini 2.5 Flash";
const IMAGE_MODEL_LABEL = "Gemini 3 Flash Image";

interface GenMediaPanelProps {
  result: RoastResult;
  rankInfo?: { rank: number; totalCards: number; totalRoasts: number; percentile: number } | null;
  // The user's uploaded/source photo (base64 data URL). Only present in-session,
  // right after generation — enables the input→output likeness comparison.
  inputImage?: string | null;
  // Wall-clock time the roast+art took to generate, measured client-side.
  generationMs?: number | null;
  isLegend?: boolean;
  onRegenerate?: () => Promise<void>;
  isRegenerating?: boolean;
}

// Small labelled stat cell
function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-white/40 leading-none mb-1.5">{label}</span>
      <span className="text-lg font-semibold text-white leading-none">{value}</span>
      {sub && <span className="text-[11px] text-white/40 mt-1">{sub}</span>}
    </div>
  );
}

// One guardrail line in the Responsible AI list
function Guardrail({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[13px] text-white/60 leading-snug">
      <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export function GenMediaPanel({
  result,
  rankInfo,
  inputImage,
  generationMs,
  isLegend = false,
  onRegenerate,
  isRegenerating = false,
}: GenMediaPanelProps) {
  const hasArt = !!result.archetypeImage;
  const genSeconds = generationMs ? Math.max(1, Math.round(generationMs / 1000)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="relative"
    >
      {/* Subtle indigo glow to match the brand accent */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 rounded-2xl blur-2xl pointer-events-none" />

      <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
        <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

        <div className="px-6 py-7 sm:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Under the Hood</h3>
          </div>
          <p className="text-sm text-white/50 mb-7 ml-11">
            A multimodal generative-media pipeline — one roast, two models.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: the pipeline + likeness before/after */}
            <div>
              {/* Pipeline steps */}
              <p className="text-xs uppercase tracking-wider text-white/40 mb-3">The Pipeline</p>
              <div className="flex items-stretch gap-2 mb-6">
                <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.07] px-3 py-3">
                  <p className="text-[11px] text-white/40 mb-1">1 · Understand</p>
                  <p className="text-[13px] font-medium text-white leading-snug">Parse profile</p>
                  <p className="text-[11px] text-white/40 mt-1">resume · LinkedIn · web · X</p>
                </div>
                <div className="flex items-center text-indigo-400/60">→</div>
                <div className="flex-1 rounded-xl bg-white/[0.04] border border-indigo-500/20 px-3 py-3">
                  <p className="text-[11px] text-white/40 mb-1">2 · Roast</p>
                  <p className="text-[13px] font-medium text-white leading-snug">Text gen</p>
                  <p className="text-[11px] text-indigo-300/70 mt-1">{TEXT_MODEL}</p>
                </div>
                <div className="flex items-center text-violet-400/60">→</div>
                <div className="flex-1 rounded-xl bg-white/[0.04] border border-violet-500/20 px-3 py-3">
                  <p className="text-[11px] text-white/40 mb-1">3 · Illustrate</p>
                  <p className="text-[13px] font-medium text-white leading-snug">Image gen</p>
                  <p className="text-[11px] text-violet-300/70 mt-1">{IMAGE_MODEL_LABEL}</p>
                </div>
              </div>

              {/* Likeness before/after — only when we have the source photo */}
              {inputImage && hasArt ? (
                <>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
                    Likeness Preservation
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-black/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={inputImage} alt="Your source photo" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] text-white/40 text-center mt-1.5">Your photo</p>
                    </div>
                    <div className="text-violet-400/70 text-lg">→</div>
                    <div className="flex-1">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-violet-500/20 bg-black/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={result.archetypeImage} alt="Generated card art" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] text-violet-300/60 text-center mt-1.5">Generated art</p>
                    </div>
                  </div>
                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      disabled={isRegenerating}
                      className="mt-3 w-full h-9 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-200 text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                    >
                      {isRegenerating ? "Regenerating…" : "↻ Regenerate artwork"}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {isLegend
                    ? "The illustration is generated from a reference likeness, then styled into a collectible card scene that matches the roast — no stock art, every card is one-of-one."
                    : "Add a profile photo when you roast yourself and the model preserves your likeness into the card art — a see-it-yourself demo of identity-consistent image generation."}
                </p>
              )}
            </div>

            {/* RIGHT: honest metrics + responsible AI */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 mb-4">By the Numbers</p>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  {rankInfo?.totalRoasts ? (
                    <Stat label="Cards generated" value={rankInfo.totalRoasts.toLocaleString()} sub="and counting" />
                  ) : (
                    <Stat label="Output" value="1-of-1" sub="every card unique" />
                  )}
                  {rankInfo ? (
                    <Stat label="This card ranks" value={`#${rankInfo.rank.toLocaleString()}`} sub={`of ${rankInfo.totalRoasts.toLocaleString()}`} />
                  ) : (
                    <Stat label="Modalities" value="Text + Image" sub="single request" />
                  )}
                  <Stat label="Models" value="2" sub={`${TEXT_MODEL.split(" ")[0]} 2.5 + 3`} />
                  {genSeconds ? (
                    <Stat label="Generated in" value={`${genSeconds}s`} sub="text + art, end-to-end" />
                  ) : (
                    <Stat label="Share loop" value="1 tap" sub="card → X / LinkedIn" />
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Responsible by Design</p>
                <ul className="space-y-2">
                  <Guardrail>No text baked into images — avoids the garbled-text artifacts that plague AI art</Guardrail>
                  {isLegend ? (
                    <Guardrail>Public figures use public info only; affectionate roast, never cruel or defamatory</Guardrail>
                  ) : (
                    <Guardrail>Roasts target the role and résumé, never attack you by name</Guardrail>
                  )}
                  <Guardrail>Your photo is used to generate one card, not retained for training</Guardrail>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
