"use client";

interface ShareCardProps {
  score: number;
  archetypeName: string;
  archetypeEmoji: string;
  archetypeDescription: string;
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

function StarRating({ score }: { score: number }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= stars ? "text-[#ffd700]" : "text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ShareCard({
  score,
  archetypeName,
  archetypeEmoji,
  archetypeDescription,
  productSense,
  execution,
  leadership,
  dreamRole,
  dreamRoleReaction,
  bangerQuote,
}: ShareCardProps) {
  return (
    <div className="relative w-[320px] sm:w-[360px]">
      {/* Card Background */}
      <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] rounded-2xl border border-[#6366f1]/30 overflow-hidden shadow-2xl shadow-[#6366f1]/20">
        {/* Top Accent Bar with Branding */}
        <div className="h-8 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#6366f1] flex items-center justify-center">
          <span className="text-white text-xs font-bold tracking-widest">PM ROAST</span>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Overall Rating + Archetype Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-center">
              <div
                className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#ff8c00]"
                style={{ fontFamily: "system-ui" }}
              >
                {score}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#ffd700]/70 font-semibold">
                Overall
              </p>
            </div>

            {/* Archetype Badge */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/40 flex items-center justify-center">
              <span className="text-5xl">{archetypeEmoji}</span>
            </div>
          </div>

          {/* Archetype Name */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white leading-tight mb-2">
              {stripMarkdown(archetypeName)}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {stripMarkdown(archetypeDescription)}
            </p>
          </div>

          {/* Capability Stats */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-sm text-gray-300 font-medium">Product Sense</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#6366f1]">{productSense}</span>
                <StarRating score={productSense} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-sm text-gray-300 font-medium">Execution</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#6366f1]">{execution}</span>
                <StarRating score={execution} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <span className="text-sm text-gray-300 font-medium">Leadership</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#6366f1]">{leadership}</span>
                <StarRating score={leadership} />
              </div>
            </div>
          </div>

          {/* Dream Role Tag */}
          <div className="flex items-center justify-between mb-4 py-2 px-3 bg-white/5 rounded-lg">
            <span className="text-xs text-gray-400">Dream Role</span>
            <span className="text-sm font-semibold text-white">{dreamRole}</span>
          </div>

          {/* Dream Role Reaction */}
          <p className="text-sm text-gray-200 italic mb-4 text-center leading-relaxed">
            &quot;{stripMarkdown(dreamRoleReaction)}&quot;
          </p>

          {/* Banger Quote */}
          <div className="p-3 bg-[#6366f1]/10 rounded-lg border border-[#6366f1]/20">
            <p className="text-xs text-gray-300 text-center italic">
              &quot;{stripMarkdown(bangerQuote)}&quot;
            </p>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="h-8 bg-gradient-to-r from-[#6366f1]/20 via-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center border-t border-[#6366f1]/20">
          <span className="text-[10px] text-gray-400">pmroast.com</span>
        </div>
      </div>

      {/* Card Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#6366f1]/20 via-[#8b5cf6]/20 to-[#6366f1]/20 rounded-2xl blur-xl -z-10" />
    </div>
  );
}
