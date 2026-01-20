"use client";

import { useState, useEffect } from "react";
import { ShareableCard, shareableCardToRoastResult } from "@/lib/share";
import { DreamRole } from "@/lib/types";
import { Results } from "@/components/steps/Results";

interface SharePageClientProps {
  card: ShareableCard;
  dreamRoleLabel: string;
  encodedData: string;
}

export function SharePageClient({ card, encodedData }: SharePageClientProps) {
  const [archetypeImage, setArchetypeImage] = useState<string | undefined>(undefined);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Try to retrieve the generated image from sessionStorage, or generate it via API
  useEffect(() => {
    async function loadImage() {
      if (typeof window === "undefined") return;

      // First, try sessionStorage
      try {
        const storedImage = sessionStorage.getItem(`pm-roast-image-${encodedData}`);
        if (storedImage) {
          setArchetypeImage(storedImage);
          return;
        }
      } catch (e) {
        console.warn("Could not retrieve image from sessionStorage:", e);
      }

      // If no cached image, generate one via API
      setIsLoadingImage(true);
      try {
        const response = await fetch("/api/card-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            archetypeName: card.n,
            archetypeDescription: card.d,
            element: card.el,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.image) {
            setArchetypeImage(data.image);
            // Cache it in sessionStorage for this tab
            try {
              sessionStorage.setItem(`pm-roast-image-${encodedData}`, data.image);
            } catch (e) {
              console.warn("Could not cache image in sessionStorage:", e);
            }
          }
        }
      } catch (error) {
        console.error("Failed to generate card image:", error);
      } finally {
        setIsLoadingImage(false);
      }
    }

    loadImage();
  }, [encodedData, card.n, card.d, card.el]);

  // Convert ShareableCard to RoastResult
  const result = shareableCardToRoastResult(card);

  // Add the archetype image if available
  if (archetypeImage) {
    result.archetypeImage = archetypeImage;
  }

  const dreamRole = card.dr as DreamRole;

  const handleStartOver = () => {
    window.location.href = "/";
  };

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

      {/* Main Content - reuse Results component */}
      <section className="flex-1 flex flex-col items-center px-6 pt-24 pb-12">
        <Results
          result={result}
          dreamRole={dreamRole}
          onStartOver={handleStartOver}
          isSharePage
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
