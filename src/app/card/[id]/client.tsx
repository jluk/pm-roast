"use client";

import { RoastResult, DreamRole } from "@/lib/types";
import { Results } from "@/components/steps/Results";

interface CardPageClientProps {
  result: RoastResult;
  dreamRole: DreamRole;
  dreamRoleLabel: string;
  cardId: string;
}

export function CardPageClient({ result, dreamRole, cardId }: CardPageClientProps) {
  const handleStartOver = () => {
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
            PM Roast
          </a>
          {/* Center: Navigation Links - "Roast Me" is active since user just finished a roast */}
          <div className="hidden sm:flex items-center gap-1">
            <a
              href="/#roast-me"
              className="px-3 py-1.5 text-sm text-foreground bg-white/5 border-b-2 border-indigo-500 rounded-lg transition-all"
            >
              Roast Me
            </a>
            <a
              href="/#mt-roastmore"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
            >
              Mt. Roastmore
            </a>
            <a
              href="/#archetypes"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
            >
              Archetypes
            </a>
          </div>
          <span className="text-xs text-muted-foreground">Powered by Gemini</span>
        </div>
      </nav>

      {/* Main Content - reuse Results component */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <Results
          result={result}
          dreamRole={dreamRole}
          onStartOver={handleStartOver}
          isSharePage
          cardId={cardId}
        />
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
