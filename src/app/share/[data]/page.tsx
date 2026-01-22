import { Metadata } from "next";
import { decodeCardData } from "@/lib/share";
import { DREAM_ROLES, DreamRole } from "@/lib/types";
import { SharePageClient } from "./client";

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
  const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.pmroast.com"}/api/og?data=${data}`;

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

  return <SharePageClient card={card} dreamRoleLabel={dreamRoleLabel} encodedData={data} />;
}
