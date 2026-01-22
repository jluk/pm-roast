import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "edge";

interface StoredCard {
  result: {
    archetype: {
      name: string;
      description: string;
      emoji: string;
      element: string;
      weakness?: string;
      stage?: string;
    };
    careerScore: number;
    bangerQuote?: string;
    moves?: { name: string; energyCost: number; damage: number }[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cardId = url.searchParams.get("cid");

    // If no card ID, show fallback
    if (!cardId) {
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

    // TEST: Return immediately before KV
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#2a1a3a", color: "white" }}>
          <div style={{ fontSize: 48, fontWeight: 700 }}>Before KV</div>
          <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>CID: {cardId}</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    // Fetch card from KV storage
    let storedCard: StoredCard | null = null;
    try {
      const data = await kv.get<string>(`card:${cardId}`);
      if (data) {
        storedCard = typeof data === 'string' ? JSON.parse(data) : data as unknown as StoredCard;
      }
    } catch (kvError) {
      console.error("KV fetch error:", kvError);
    }

    // If card not found, show fallback
    if (!storedCard) {
      return new ImageResponse(
        (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0a0a0a", color: "white" }}>
            <div style={{ fontSize: 48, fontWeight: 700 }}>PM Roast</div>
            <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>Card not found</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Test: Return static image when card found (no data extraction)
    return new ImageResponse(
      (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#1a3a1a", color: "white" }}>
          <div style={{ fontSize: 48, fontWeight: 700 }}>Card Found!</div>
          <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>ID: {cardId}</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error("OG generation error:", err);
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
}
