"use client";

import { useState, useEffect } from "react";
import { ShareableCard, shareableCardToRoastResult } from "@/lib/share";
import { DreamRole } from "@/lib/types";
import { Results } from "@/components/steps/Results";
import { SiteNav, SiteFooter } from "@/components/SiteChrome";

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
      <SiteNav active="roast-me" right="gemini" />

      {/* Main Content - reuse Results component */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-8">
        <Results
          result={result}
          dreamRole={dreamRole}
          onStartOver={handleStartOver}
          isSharePage
        />
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
