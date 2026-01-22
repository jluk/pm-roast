import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

// Use Node.js runtime to directly access KV (edge runtime can't self-reference)
export const runtime = "nodejs";

interface OGCardData {
  n: string;
  d: string;
  e: string;
  s: number;
  el: string;
  q: string;
  m: { n: string; c: number; d: number; e?: string }[];
  w: string;
  st: string;
}

async function getCardById(cardId: string): Promise<OGCardData | null> {
  try {
    // Direct KV access (Node.js runtime)
    const storedCard = await kv.get<{
      result: {
        archetype: { name: string; description: string; emoji: string; element: string; stage?: string; weakness?: string };
        moves: { name: string; energyCost: number; damage: number; effect?: string }[];
        careerScore: number;
        bangerQuote?: string;
      };
    }>(`card:${cardId}`);

    if (!storedCard) {
      console.log("Card not found in KV:", cardId);
      return null;
    }

    const { result } = storedCard;

    // Transform to OG format
    return {
      n: result.archetype.name,
      d: result.archetype.description,
      e: result.archetype.emoji,
      s: result.careerScore,
      el: result.archetype.element,
      q: result.bangerQuote || result.archetype.description,
      m: result.moves.map(m => ({
        n: m.name,
        c: m.energyCost,
        d: m.damage,
        e: m.effect,
      })),
      w: result.archetype.weakness || "Meetings",
      st: result.archetype.stage || "Senior",
    };
  } catch (err) {
    console.error("KV fetch exception:", err);
    return null;
  }
}

function decodeCardData(encoded: string): OGCardData | null {
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const binaryString = atob(base64);
    const utf8Bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      utf8Bytes[i] = binaryString.charCodeAt(i);
    }
    return JSON.parse(new TextDecoder().decode(utf8Bytes));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const cardId = url.searchParams.get("id");
  const data = url.searchParams.get("data");

  let card: OGCardData | null = null;
  if (cardId) card = await getCardById(cardId);
  else if (data) card = decodeCardData(data);

  // If no card, show fallback
  if (!card) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
          <div style={{ fontSize: 48, fontWeight: 700 }}>PM Roast</div>
          <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>Get your PM trading card</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Card found - show minimal card info
  const name = (card.n || "Unknown").replace(/\*+/g, "").trim();
  const score = card.s || 0;
  const emoji = card.e || "🔥";

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
        <div style={{ fontSize: 80 }}>{emoji}</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginTop: 24 }}>{name}</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#ef4444", marginTop: 16 }}>{score}/100</div>
        <div style={{ fontSize: 24, color: "#888", marginTop: 24 }}>pmroast.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
