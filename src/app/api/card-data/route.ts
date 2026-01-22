import { NextRequest, NextResponse } from "next/server";
import { getCard } from "@/lib/card-storage";

// Internal API endpoint to fetch card data for OG image generation
// This runs in Node.js runtime where @vercel/kv works
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("id");

  if (!cardId) {
    return NextResponse.json({ error: "Missing card ID" }, { status: 400 });
  }

  try {
    const storedCard = await getCard(cardId);

    if (!storedCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const { result } = storedCard;

    // Return card data in the format needed for OG image
    return NextResponse.json({
      n: result.archetype.name,
      d: result.archetype.description,
      e: result.archetype.emoji,
      s: result.careerScore,
      el: result.archetype.element,
      q: result.bangerQuote,
      m: result.moves.map((move) => ({
        n: move.name,
        c: move.energyCost,
        d: move.damage,
        e: move.effect,
      })),
      w: result.archetype.weakness,
      st: result.archetype.stage,
      img: result.archetypeImage,
      userName: result.userName,
    });
  } catch (error) {
    console.error("Failed to fetch card data:", error);
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
  }
}
