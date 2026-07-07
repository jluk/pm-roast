/**
 * Fusion ("Polymerization") — merge two PM cards into one hybrid.
 *
 * The image fusion (two reference likenesses -> one coherent character) is the
 * GenMedia flex; this module owns the deterministic rules (element matrix, stat
 * formula) and the text/image prompts. Gemini calls live in /api/fuse.
 */

import { PMElement, PMMove, RoastResult } from "./types";
import { ELEMENT_SETTINGS } from "./image-generation";

// Minimal shape a fusion parent needs — satisfied by FamousCard/CelebrityCard.
export interface FusionParent {
  id: string;
  name: string;
  archetypeName: string;
  archetypeDescription: string;
  archetypeEmoji: string;
  element: PMElement;
  score: number;
  weakness: string;
  stage: string;
  bangerQuote: string;
  moves: PMMove[];
  /** Source-photo path preferred for fusion; card art is the fallback. */
  imageUrl: string;
}

// Deterministic element fusion — gives the feature "rules" (Yu-Gi-Oh style).
// Keyed by the two elements sorted alphabetically and joined with "+".
const FUSION_PAIRS: Record<string, PMElement> = {
  "chaos+data": "shipping",
  "chaos+politics": "chaos",
  "chaos+shipping": "shipping",
  "chaos+strategy": "vision",
  "chaos+vision": "vision",
  "data+politics": "strategy",
  "data+shipping": "shipping",
  "data+strategy": "strategy",
  "data+vision": "strategy",
  "politics+shipping": "politics",
  "politics+strategy": "politics",
  "politics+vision": "vision",
  "shipping+strategy": "shipping",
  "shipping+vision": "shipping",
  "strategy+vision": "vision",
};

export function fuseElements(a: PMElement, b: PMElement): PMElement {
  if (a === b) return a;
  const key = [a, b].sort().join("+");
  return FUSION_PAIRS[key] ?? "chaos";
}

// Fusions should feel powerful: the stronger parent, boosted by a fraction of
// the weaker one. Capped at 99 (100 is reserved / never given).
export function fuseScore(a: number, b: number): number {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return Math.min(99, hi + Math.round(lo / 10));
}

// Blend two 0-99 capability numbers with a small fusion bonus.
function blendStat(a: number, b: number): number {
  return Math.min(99, Math.round((a + b) / 2) + 6);
}

export const FUSION_TEXT_SYSTEM = `You are a savage comedy writer creating a FUSION trading card — two people "polymerized" into one hybrid PM archetype (think Yu-Gi-Oh fusion, Pokémon fusion, or the DBZ fusion dance).

Your job: invent ONE clever hybrid that genuinely combines BOTH people — their domains, their reputations, their signature energy — into a single character that is funnier and sharper than either alone. The cleverness of the combination is the whole point.

RULES:
1. The fused archetype name must clearly evoke BOTH parents (a portmanteau, a mash-up, or a title that only makes sense if you know both). 2-3 words, no "The" prefix. Example: fusing a data-obsessed metrics PM with a chaotic firefighter -> "Dashboard Arsonist".
2. Every field should reference BOTH sources — their companies, quirks, or public personas. Generic = failure.
3. Keep it playful and sharp, never cruel or defamatory. Public personas only.
4. Moves should be fused signature attacks — blend one parent's move with the other's.
5. No markdown. Respond with RAW JSON only.

Output EXACTLY this JSON shape:
{
  "archetypeName": "2-3 word fused hybrid name, no 'The' prefix",
  "archetypeDescription": "1 sentence roast of the hybrid, 60-90 chars",
  "archetypeEmoji": "single emoji capturing the fusion",
  "flavor": "nature-doc style line about this hybrid, 60-90 chars",
  "stage": "one of: Legendary|Mythical|Fused",
  "weakness": "1-2 word ironic weakness",
  "moves": [
    {"name": "2-3 word fused move", "energyCost": 2, "damage": 70, "effect": "funny quip, 30-55 chars"},
    {"name": "2-3 word fused move", "energyCost": 3, "damage": 90, "effect": "funny quip, 30-55 chars"},
    {"name": "ultimate fused move", "energyCost": 4, "damage": 130, "effect": "funny quip, 30-55 chars"}
  ],
  "roastBullets": ["3-4 roasts of the hybrid that reference BOTH people, max 90 chars each"],
  "bangerQuote": "screenshot-worthy line about this fusion referencing both, max 140 chars",
  "naturalRival": "funny person/concept this hybrid fears, max 60 chars",
  "capabilities": {"productSense": 0-99, "execution": 0-99, "leadership": 0-99}
}`;

export function buildFusionUserPrompt(a: FusionParent, b: FusionParent, fusedElement: PMElement): string {
  const describe = (p: FusionParent) =>
    `- Name: ${p.name}\n  Archetype: "${p.archetypeName}" — ${p.archetypeDescription}\n  Element: ${p.element}, Signature quote: "${p.bangerQuote}"\n  Moves: ${p.moves.map((m) => m.name).join(", ")}`;
  return `Fuse these two into ONE hybrid PM archetype.

PARENT A:
${describe(a)}

PARENT B:
${describe(b)}

The fused card's element is "${fusedElement}" — let that flavor the vibe.
Make the hybrid unmistakably a blend of BOTH ${a.name} and ${b.name}. Respond with raw JSON only.`;
}

export function buildFusionImagePrompt(
  archetypeName: string,
  archetypeDescription: string,
  element: PMElement,
  nameA: string,
  nameB: string,
): string {
  const s = ELEMENT_SETTINGS[element];
  return `Create ONE single fused trading-card character that MERGES the two people in the reference images into a single coherent hybrid person — blend their most recognizable facial features (bone structure, eyes, hair, expression) and their vibe into ONE believable face on ONE body. This is the fusion of ${nameA} and ${nameB} into the hybrid archetype "${archetypeName}": ${archetypeDescription}.

STYLE:
- Pokémon TCG watercolor illustration style, vibrant, dynamic energy
- Colors: ${s.colors}
- Background: ${s.bg}
- Single hybrid character, prominently featured, face clearly visible and LARGE
- LANDSCAPE 16:9

CRITICAL:
- Produce ONE fused person, NOT two people side by side, NOT a collage
- The result should read as a single believable individual carrying features of both
- NO text, letters, numbers, words, or labels anywhere in the image (AI text always looks wrong)
- Illustration only — no card borders, frames, or trading-card UI`;
}

// Assemble the full RoastResult for a fusion, with canned fusion-flavored
// gaps/roadmap/podcast (like legend cards) so the results page renders fully.
export function assembleFusionCard(
  a: FusionParent,
  b: FusionParent,
  fusedElement: PMElement,
  creative: {
    archetypeName: string;
    archetypeDescription: string;
    archetypeEmoji: string;
    flavor: string;
    stage: string;
    weakness: string;
    moves: PMMove[];
    roastBullets: string[];
    bangerQuote: string;
    naturalRival: string;
    capabilities: { productSense: number; execution: number; leadership: number };
  },
  archetypeImage: string | null,
): RoastResult {
  const score = fuseScore(a.score, b.score);
  return {
    userName: `${a.name} × ${b.name}`,
    roastBullets: creative.roastBullets,
    archetype: {
      name: creative.archetypeName,
      description: creative.archetypeDescription,
      emoji: creative.archetypeEmoji,
      element: fusedElement,
      flavor: creative.flavor,
      stage: creative.stage || "Fused",
      weakness: creative.weakness,
    },
    moves: creative.moves,
    archetypeImage: archetypeImage || undefined,
    careerScore: score,
    capabilities: {
      productSense: blendStat(a.score, creative.capabilities.productSense),
      execution: blendStat(b.score, creative.capabilities.execution),
      leadership: creative.capabilities.leadership,
    },
    gaps: [
      "Two egos, one card — good luck",
      "Requires double the therapy",
      "Can't decide whose name goes first",
    ],
    roadmap: [
      { month: 1, title: "Stabilize the Fusion", actions: ["Merge conflicting visions", "Survive the ego collision"] },
      { month: 2, title: "Combine Powers", actions: ["Weaponize both reputations", "Ship at double velocity"] },
      { month: 3, title: "Dominate", actions: ["Out-strategize both originals", "Acquire a small country"] },
      { month: 4, title: "Transcend", actions: ["Become an industry meme", "Achieve fusion permanence"] },
    ],
    podcastEpisodes: [
      { title: "Browse Lenny's Podcast", guest: "Various PM Leaders", reason: "Study both halves of this fusion" },
    ],
    bangerQuote: creative.bangerQuote,
    dreamRoleReaction: `A fusion of ${a.name} and ${b.name} doesn't chase roles — roles chase it.`,
    naturalRival: creative.naturalRival,
    fusion: {
      parents: [
        { id: a.id, name: a.name, emoji: a.archetypeEmoji },
        { id: b.id, name: b.name, emoji: b.archetypeEmoji },
      ],
    },
  };
}
