import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFamousCardById, FamousCard } from "@/lib/famous-cards";
import { getCelebrityCardById, CelebrityCard } from "@/lib/celebrity-cards";
import { LegendPageClient } from "./client";

type AnyCard = FamousCard | CelebrityCard;

interface PageProps {
  params: Promise<{ id: string }>;
}

function getCardById(id: string): AnyCard | undefined {
  return getFamousCardById(id) || getCelebrityCardById(id);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = getCardById(id);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pmroast.com";

  if (!card) {
    return {
      title: "Legend Not Found | PM Roast",
    };
  }

  const title = `${card.name} is "${card.archetypeName}" | PM Roast`;
  const description = `${card.archetypeDescription} - Score: ${card.score}/100`;

  // Use the card's generated image for OG
  const ogImageUrl = `${baseUrl}${card.imageUrl}`;

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
          alt: `${card.name} - ${card.archetypeName}`,
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

export default async function LegendPage({ params }: PageProps) {
  const { id } = await params;
  const card = getCardById(id);

  if (!card) {
    notFound();
  }

  return <LegendPageClient card={card} />;
}
