"use client";

import { PokemonCard, PMElement, PMMove } from "./PokemonCard";

interface ShareCardProps {
  score: number;
  archetypeName: string;
  archetypeEmoji: string;
  archetypeDescription: string;
  archetypeImage?: string;
  element?: PMElement;
  stage?: string;
  weakness?: string;
  flavor?: string;
  moves?: PMMove[];
  productSense: number;
  execution: number;
  leadership: number;
  dreamRole: string;
  dreamRoleReaction: string;
  bangerQuote: string;
}

// Strip markdown formatting from text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/_/g, "")
    .replace(/`/g, "")
    .replace(/#{1,6}\s/g, "")
    .trim();
}

// Default moves if none provided
const DEFAULT_MOVES: PMMove[] = [
  { name: "Scope Creep", energyCost: 1, damage: 30, effect: "Add 3 requirements mid-sprint." },
  { name: "Stakeholder Dodge", energyCost: 2, damage: 50 },
];

export function ShareCard({
  score,
  archetypeName,
  archetypeEmoji,
  archetypeDescription,
  archetypeImage,
  element = "chaos",
  stage = "Senior",
  weakness = "Meetings",
  flavor,
  moves = DEFAULT_MOVES,
  productSense,
  execution,
  leadership,
  dreamRole,
  dreamRoleReaction,
  bangerQuote,
}: ShareCardProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Pokemon Card */}
      <PokemonCard
        score={score}
        archetypeName={stripMarkdown(archetypeName)}
        archetypeEmoji={archetypeEmoji}
        archetypeDescription={stripMarkdown(archetypeDescription)}
        archetypeImage={archetypeImage}
        element={element}
        stage={stage}
        weakness={weakness}
        moves={moves}
        productSense={productSense}
        execution={execution}
        leadership={leadership}
        flavor={stripMarkdown(flavor || bangerQuote)}
      />

      {/* Dream Role Info - displayed below the card */}
      <div className="w-full max-w-[360px] space-y-3">
        <div className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-lg border border-white/10">
          <span className="text-xs text-gray-400">Dream Role</span>
          <span className="text-sm font-semibold text-white">{dreamRole}</span>
        </div>

        <p className="text-sm text-gray-300 italic text-center leading-relaxed px-2">
          &quot;{stripMarkdown(dreamRoleReaction)}&quot;
        </p>
      </div>
    </div>
  );
}
