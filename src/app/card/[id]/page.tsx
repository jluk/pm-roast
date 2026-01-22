import { Metadata } from "next";
import { getCard } from "@/lib/card-storage";
import { DREAM_ROLES, DreamRole } from "@/lib/types";
import { CardPageClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const storedCard = await getCard(id);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pmroast.com";

  if (!storedCard) {
    const fallbackOgUrl = `${baseUrl}/api/og`;
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

  // Generate OG image URL with query params (avoids KV issues in edge runtime)
  const ogParams = new URLSearchParams({
    name: result.archetype.name,
    score: String(result.careerScore),
    desc: result.archetype.description.slice(0, 100),
    elem: result.archetype.element,
  });
  const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;

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
