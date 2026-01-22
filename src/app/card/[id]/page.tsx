import { Metadata } from "next";
import { getCard } from "@/lib/card-storage";
import { DREAM_ROLES, DreamRole, RoastResult } from "@/lib/types";
import { CardPageClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Encode card data for OG image URL (avoids edge runtime fetch issues)
function encodeOGData(result: RoastResult): string {
  const ogData = {
    n: result.archetype.name,
    d: result.archetype.description,
    e: result.archetype.emoji,
    s: result.careerScore,
    el: result.archetype.element,
    q: result.bangerQuote || result.archetype.description,
    m: result.moves?.slice(0, 2).map(m => ({
      n: m.name,
      c: m.energyCost,
      d: m.damage,
    })) || [],
    w: result.archetype.weakness || "Meetings",
    st: result.archetype.stage || "Senior",
  };

  const json = JSON.stringify(ogData);
  const base64 = Buffer.from(json, "utf-8").toString("base64");
  // URL-safe base64
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const storedCard = await getCard(id);

  if (!storedCard) {
    const fallbackOgUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.pmroast.com"}/api/og?id=${id}`;
    return {
      title: "PM Roast | Get Brutally Honest Career Feedback",
      openGraph: {
        title: "PM Roast | Get Brutally Honest Career Feedback",
        images: [{ url: fallbackOgUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        images: [fallbackOgUrl],
      },
    };
  }

  const { result, isLegend } = storedCard;
  const legendName = result.userName || "This legend";
  const title = isLegend
    ? `${legendName} got PM roasted - ${result.careerScore}/100 | PM Roast`
    : `I'm a "${result.archetype.name}" - ${result.careerScore}/100 | PM Roast`;
  const description = isLegend
    ? `${legendName} is a "${result.archetype.name}". ${result.archetype.description}`
    : result.bangerQuote;

  // Generate OG image URL with encoded card data (avoids edge runtime fetch issues)
  const encodedData = encodeOGData(result);
  const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.pmroast.com"}/api/og?data=${encodedData}`;

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
          alt: `PM Roast Card - ${result.archetype.name}`,
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

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;
  const storedCard = await getCard(id);

  if (!storedCard) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold mb-4">Card not found</h1>
        <p className="text-gray-400 mb-8">This roast card doesn&apos;t exist or has expired.</p>
        <a
          href="/"
          className="px-6 py-3 bg-[#6366f1] text-white rounded-lg font-semibold hover:bg-[#5558e3] transition-colors"
        >
          Get Your Own Roast
        </a>
      </main>
    );
  }

  const { result, dreamRole, isLegend } = storedCard;
  const dreamRoleLabel = DREAM_ROLES[dreamRole as DreamRole]?.label || dreamRole;

  return <CardPageClient result={result} dreamRole={dreamRole} dreamRoleLabel={dreamRoleLabel} cardId={id} isLegend={isLegend} />;
}
