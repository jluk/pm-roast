import { Metadata } from "next";
import { decodeCardData } from "@/lib/share";
import { DREAM_ROLES, DreamRole } from "@/lib/types";
import { ShareCard } from "@/components/ShareCard";
import { PMElement, PMMove } from "@/components/PokemonCard";

interface PageProps {
  params: Promise<{ data: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await params;
  const card = decodeCardData(data);

  if (!card) {
    return {
      title: "PM Roast | Get Brutally Honest Career Feedback",
    };
  }

  const title = `I'm a "${card.n}" - ${card.s}/100 | PM Roast`;
  const description = card.q;

  // Generate OG image URL
  const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://pmroast.com"}/api/og?data=${data}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `PM Roast Card - ${card.n}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { data } = await params;
  const card = decodeCardData(data);

  if (!card) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold mb-4">Card not found</h1>
        <p className="text-gray-400 mb-8">This roast card doesn&apos;t exist or the link is invalid.</p>
        <a
          href="/"
          className="px-6 py-3 bg-[#6366f1] text-white rounded-lg font-semibold hover:bg-[#5558e3] transition-colors"
        >
          Get Your Own Roast
        </a>
      </main>
    );
  }

  const dreamRoleLabel = DREAM_ROLES[card.dr as DreamRole]?.label || card.dr;

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

      {/* Card Display */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-400 mb-2">Someone got roasted...</p>
          <h1 className="text-2xl font-bold text-white">They&apos;re a &quot;{card.n}&quot;</h1>
        </div>

        <ShareCard
          score={card.s}
          archetypeName={card.n}
          archetypeEmoji={card.e}
          archetypeDescription={card.d}
          element={(card.el as PMElement) || "chaos"}
          stage={card.st || "Senior"}
          weakness={card.w || "Meetings"}
          flavor={card.f || card.d}
          moves={card.m ? card.m.map(m => ({
            name: m.n,
            energyCost: m.c,
            damage: m.d,
            effect: m.e,
          } as PMMove)) : undefined}
          productSense={card.ps}
          execution={card.ex}
          leadership={card.ld}
          dreamRole={dreamRoleLabel}
          dreamRoleReaction={card.rr}
          bangerQuote={card.q}
        />

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 mb-4">Think you can do better?</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl font-semibold hover:from-[#5558e3] hover:to-[#7c4fe0] transition-all shadow-lg shadow-[#6366f1]/25"
          >
            Get Your Own Roast
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
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
