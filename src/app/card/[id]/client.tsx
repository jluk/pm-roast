"use client";

import { RoastResult, DreamRole } from "@/lib/types";
import { Results } from "@/components/steps/Results";
import { SiteNav, SiteFooter } from "@/components/SiteChrome";

interface CardPageClientProps {
  result: RoastResult;
  dreamRole: DreamRole;
  dreamRoleLabel: string;
  cardId: string;
  isLegend?: boolean;
}

export function CardPageClient({ result, dreamRole, cardId, isLegend }: CardPageClientProps) {
  const handleStartOver = () => {
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <SiteNav active="roast-me" right="gemini" />

      {/* Main Content - reuse Results component */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <Results
          result={result}
          dreamRole={dreamRole}
          onStartOver={handleStartOver}
          isSharePage
          cardId={cardId}
          isLegend={isLegend}
        />
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
