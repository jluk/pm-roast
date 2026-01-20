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

  if (!storedCard) {
    return {
      title: "PM Roast | Get Brutally Honest Career Feedback",
    };
  }

  const { result } = storedCard;
  const title = `I'm a "${result.archetype.name}" - ${result.careerScore}/100 | PM Roast`;
  const description = result.bangerQuote;

  // Generate OG image URL
  const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://pmroast.com"}/api/og?id=${id}`;

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

  const { result, dreamRole } = storedCard;
  const dreamRoleLabel = DREAM_ROLES[dreamRole as DreamRole]?.label || dreamRole;

  return <CardPageClient result={result} dreamRole={dreamRole} dreamRoleLabel={dreamRoleLabel} cardId={id} />;
}
